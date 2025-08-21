
import React, { useState, useEffect, useRef } from 'react';
import { AlarmClockIcon, TrashIcon } from './icons';

const TIMERS_STORAGE_KEY = 'kitchenMetricsGlobalTimers';
const ALARM_SOUND_URL = 'https://cdn.pixabay.com/audio/2022/03/15/audio_1b759f216e.mp3';

interface Timer {
    id: string;
    name: string;
    remainingSeconds: number;
    isPaused: boolean;
}

const GlobalTimer: React.FC = () => {
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [timers, setTimers] = useState<Timer[]>([]);
    
    // Form state
    const [newName, setNewName] = useState('');
    const [newMinutes, setNewMinutes] = useState('');
    const [newSeconds, setNewSeconds] = useState('');

    const [activeAlarm, setActiveAlarm] = useState<Timer | null>(null);
    
    const alarmAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        try {
            const savedTimers = localStorage.getItem(TIMERS_STORAGE_KEY);
            if (savedTimers) {
                setTimers(JSON.parse(savedTimers));
            }
        } catch (error) { console.error("Failed to load timers", error); }
        
        alarmAudioRef.current = new Audio(ALARM_SOUND_URL);
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(TIMERS_STORAGE_KEY, JSON.stringify(timers));
        } catch (error) { console.error("Failed to save timers", error); }
    }, [timers]);

    useEffect(() => {
        const interval = setInterval(() => {
            let timersUpdated = false;
            const finishedTimers: Timer[] = [];

            const nextTimers = timers.map(timer => {
                if (!timer.isPaused && timer.remainingSeconds > 0) {
                    timersUpdated = true;
                    const newRemaining = timer.remainingSeconds - 1;
                    if (newRemaining <= 0) {
                        finishedTimers.push(timer);
                        return { ...timer, remainingSeconds: 0, isPaused: true };
                    }
                    return { ...timer, remainingSeconds: newRemaining };
                }
                return timer;
            });

            if (finishedTimers.length > 0) {
                const alarmTimer = finishedTimers[0];
                setActiveAlarm(alarmTimer);
                alarmAudioRef.current?.play().catch(e => console.error("Audio play failed:", e));
                if ('Notification' in window) {
                    Notification.requestPermission().then(permission => {
                        const message = `¡El temporizador "${alarmTimer.name}" ha terminado!`;
                        if (permission === 'granted') {
                            new Notification('KitchenMetrics', { body: message, icon: '/vite.svg' });
                        }
                    });
                }
                setTimers(prev => prev.filter(t => !finishedTimers.find(ft => ft.id === t.id)));
            } else if (timersUpdated) {
                setTimers(nextTimers);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [timers]);

    const stopAlarm = () => {
        setActiveAlarm(null);
        if (alarmAudioRef.current) {
            alarmAudioRef.current.pause();
            alarmAudioRef.current.currentTime = 0;
        }
    };

    const handleAddTimer = () => {
        const totalSeconds = (parseInt(newMinutes) || 0) * 60 + (parseInt(newSeconds) || 0);
        if (totalSeconds <= 0 || !newName.trim()) {
            alert("Por favor, introduce un nombre y una duración para el temporizador.");
            return;
        }

        const newTimer: Timer = {
            id: `timer-${Date.now()}`,
            name: newName.trim(),
            remainingSeconds: totalSeconds,
            isPaused: false,
        };

        setTimers(prev => [...prev, newTimer]);
        setNewName('');
        setNewMinutes('');
        setNewSeconds('');
    };

    const handleTogglePause = (id: string) => {
        setTimers(prev => prev.map(t => t.id === id ? { ...t, isPaused: !t.isPaused } : t));
    };
    
    const handleDeleteTimer = (id: string) => {
        setTimers(prev => prev.filter(t => t.id !== id));
    };
    
    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const secs = (totalSeconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const hasActiveTimers = timers.length > 0;
    const hasRunningTimers = timers.some(t => !t.isPaused && t.remainingSeconds > 0);

    return (
        <>
            {activeAlarm && (
                 <div className="fixed inset-0 bg-red-500/50 z-[100] animate-pulse flex justify-center items-center text-white text-center p-4" onClick={stopAlarm}>
                    <div>
                        <h2 className="text-6xl font-bold">¡TIEMPO!</h2>
                        <p className="text-3xl mt-4">El temporizador "{activeAlarm.name}" ha terminado.</p>
                        <p className="mt-8 text-lg">(Haz clic en cualquier lugar para cerrar)</p>
                    </div>
                </div>
            )}
            <button
                onClick={() => setIsPanelOpen(!isPanelOpen)}
                className={`fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full shadow-lg flex items-center justify-center text-white transition-transform transform hover:scale-110 ${hasRunningTimers ? 'bg-red-500 animate-pulse' : (hasActiveTimers ? 'bg-yellow-500' : 'bg-blue-600')}`}
                aria-label="Abrir temporizadores"
            >
                {hasActiveTimers ? (
                    <div className="flex items-center justify-center space-x-1">
                        <span className="font-bold text-lg">{timers.length}</span>
                        <AlarmClockIcon />
                    </div>
                ) : (
                    <AlarmClockIcon />
                )}
            </button>
            
            {isPanelOpen && (
                <div className="fixed bottom-24 right-6 z-50 bg-white p-4 rounded-lg shadow-2xl w-80 border flex flex-col max-h-[70vh]">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 pb-4 border-b">Central de Temporizadores</h3>
                    
                    <div className="space-y-3 mb-4">
                        <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nombre (ej. Horno)" className="w-full p-2 border rounded-md" />
                        <div className="flex items-center space-x-2">
                            <input type="number" value={newMinutes} onChange={e => setNewMinutes(e.target.value)} placeholder="Min" className="w-full p-2 border rounded-md text-center" min="0" />
                            <span className="font-bold">:</span>
                            <input type="number" value={newSeconds} onChange={e => setNewSeconds(e.target.value)} placeholder="Seg" className="w-full p-2 border rounded-md text-center" min="0" max="59" />
                        </div>
                        <button onClick={handleAddTimer} className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700">
                            Crear Temporizador
                        </button>
                    </div>
                    
                    <div className="border-t pt-4 flex-grow overflow-y-auto">
                        <h4 className="text-md font-semibold text-gray-700 mb-2">Activos ({timers.length})</h4>
                        {hasActiveTimers ? (
                            <ul className="space-y-3">
                                {timers.map(timer => (
                                    <li key={timer.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                        <div className="flex-grow">
                                            <p className="font-semibold text-gray-800">{timer.name}</p>
                                            <p className={`font-mono text-xl ${timer.isPaused ? 'text-gray-400' : 'text-gray-900'}`}>{formatTime(timer.remainingSeconds)}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button onClick={() => handleTogglePause(timer.id)} className={`px-3 py-1 text-sm font-semibold rounded-md text-white ${timer.isPaused ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'}`}>
                                                {timer.isPaused ? 'Reanudar' : 'Pausar'}
                                            </button>
                                            <button onClick={() => handleDeleteTimer(timer.id)} className="p-2 rounded-md bg-red-100 text-red-600 hover:bg-red-200" aria-label="Eliminar temporizador">
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-gray-500 py-4">No hay temporizadores activos.</p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default GlobalTimer;