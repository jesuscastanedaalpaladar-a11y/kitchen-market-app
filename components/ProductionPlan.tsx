
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ProductionTask, Recipe, User, Role } from '../types';
import { ProductionIcon, TimerIcon, PlayIcon, YieldIcon, SearchIcon, UserIcon as AssignUserIcon, BoardIcon, ListIcon, GripVerticalIcon, PlusIcon } from './icons';
import GlobalTimer from './GlobalTimer';

const TIMERS_STORAGE_KEY = 'kitchenMetricsTimers';

interface ProductionPlanProps {
    tasks: ProductionTask[];
    recipes: Recipe[];
    users: User[];
    onAddTask: (recipeId: string, quantity: number) => void;
    onCompleteTaskAndAddBatch: (task: ProductionTask, recipe: Recipe, actualYield: number, duration: number, producerName: string) => void;
    currentUser: User;
    onAssignTask: (taskId: string, userId: number | null) => void;
    onReorderTasks: (draggedId: string, targetId: string) => void;
}

const formatTime = (totalSeconds: number) => `${Math.floor(totalSeconds / 60).toString().padStart(2, '0')}:${(totalSeconds % 60).toString().padStart(2, '0')}`;
const getStatusClasses = (status: ProductionTask['status']) => status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' : status === 'En progreso' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
const baseButtonClasses = "px-4 py-2 text-base font-semibold rounded-lg text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all flex items-center justify-center space-x-2";

const ProductionPlan: React.FC<ProductionPlanProps> = ({ tasks, recipes, users, onAddTask, onCompleteTaskAndAddBatch, currentUser, onAssignTask, onReorderTasks }) => {
    const [timers, setTimers] = useState<{ [key: string]: { startTime: number | null; accumulatedTime: number; isActive: boolean } }>({});
    
    // Modal State
    const [isProduceModalOpen, setIsProduceModalOpen] = useState(false);
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<ProductionTask | null>(null);
    const [modalYield, setModalYield] = useState(0);
    const [selectedProducerName, setSelectedProducerName] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
    const [viewMode, setViewMode] = useState<'all' | 'mine'>('all');
    const [displayMode, setDisplayMode] = useState<'board' | 'list'>('board');
    const [dragOverId, setDragOverId] = useState<string | null>(null);

    // Add Task Modal State
    const [addTaskSearchTerm, setAddTaskSearchTerm] = useState('');
    const [newTaskRecipeId, setNewTaskRecipeId] = useState<string | null>(null);
    const [newTaskQuantity, setNewTaskQuantity] = useState<number | string>('');

    const [, setTick] = useState(0);

    const productionUsers = useMemo(() => users.filter(user => user.role === Role.Produccion || user.role === Role.Admin), [users]);
    const usersById = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);

    const recipesById = useMemo(() =>
        recipes.reduce((acc, recipe) => {
            acc[recipe.id] = recipe;
            return acc;
        }, {} as Record<string, Recipe>),
    [recipes]);

    const filteredRecipesForModal = useMemo(() => {
        if (!addTaskSearchTerm) return recipes;
        return recipes.filter(recipe => recipe.name.toLowerCase().includes(addTaskSearchTerm.toLowerCase()));
    }, [recipes, addTaskSearchTerm]);

    useEffect(() => {
        try {
            const savedTimers = localStorage.getItem(TIMERS_STORAGE_KEY);
            if (savedTimers) {
                setTimers(JSON.parse(savedTimers));
            }
        } catch (error) { console.error("Fallo al cargar los temporizadores", error); }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(TIMERS_STORAGE_KEY, JSON.stringify(timers));
        } catch (error) { console.error("Fallo al guardar los temporizadores", error); }
    }, [timers]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (Object.values(timers).some(t => t.isActive)) {
                setTick(prev => prev + 1);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [timers]);

    const handleStart = useCallback((taskId: string) => {
        setTimers(prev => ({
            ...prev,
            [taskId]: { startTime: Date.now(), accumulatedTime: prev[taskId]?.accumulatedTime || 0, isActive: true }
        }));
    }, []);

    const handlePause = useCallback((taskId: string) => {
        setTimers(prev => {
            const timer = prev[taskId];
            if (!timer || !timer.isActive || timer.startTime === null) return prev;
            const elapsed = Date.now() - timer.startTime;
            return {
                ...prev,
                [taskId]: { ...timer, startTime: null, accumulatedTime: timer.accumulatedTime + elapsed, isActive: false }
            };
        });
    }, []);

    const handleResume = useCallback((taskId: string) => {
        setTimers(prev => ({
            ...prev,
            [taskId]: { ...prev[taskId], startTime: Date.now(), isActive: true }
        }));
    }, []);
    
    const handleProduceClick = useCallback((task: ProductionTask) => {
        handlePause(task.id);
        setSelectedTask(task);
        setModalYield(task.quantityToProduce);
        
        const defaultProducer = productionUsers.find(u => u.id === currentUser.id) || productionUsers[0];
        if (defaultProducer) {
             setSelectedProducerName(defaultProducer.name);
        }
       
        setIsProduceModalOpen(true);
    }, [handlePause, productionUsers, currentUser]);
    
    const handleConfirmProduction = useCallback(() => {
        if (!selectedTask || !selectedProducerName) {
            alert('Por favor, selecciona quién realizó la producción.');
            return;
        }
        const recipe = recipesById[selectedTask.recipeId];
        if (!recipe) return;

        let finalTime = 0;
        const timer = timers[selectedTask.id];
        if (timer) {
            finalTime = Math.round((timer.accumulatedTime + (timer.isActive && timer.startTime ? Date.now() - timer.startTime : 0)) / 1000);
        }
        
        onCompleteTaskAndAddBatch(selectedTask, recipe, modalYield, finalTime, selectedProducerName);

        setTimers(prev => {
            const { [selectedTask.id]: _, ...rest } = prev;
            return rest;
        });
        
        setIsProduceModalOpen(false);
        setSelectedTask(null);
    }, [selectedTask, modalYield, selectedProducerName, onCompleteTaskAndAddBatch, recipesById, timers]);
    
    const handleAddNewTask = () => {
        if (newTaskRecipeId && typeof newTaskQuantity === 'number' && newTaskQuantity > 0) {
            onAddTask(newTaskRecipeId, newTaskQuantity);
            setIsAddTaskModalOpen(false);
            setNewTaskQuantity('');
            setNewTaskRecipeId(null);
            setAddTaskSearchTerm('');
        } else {
            alert('Por favor, selecciona una receta y especifica una cantidad válida.');
        }
    };
    
    const handleAssignmentChange = (taskId: string, userIdStr: string) => {
        const userId = userIdStr ? parseInt(userIdStr, 10) : null;
        onAssignTask(taskId, userId);
    };

    const handleDragStart = (e: React.DragEvent<HTMLElement>, taskId: string) => {
        e.dataTransfer.setData('taskId', taskId);
    };

    const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        const target = e.currentTarget;
        if (target.dataset.taskId) {
          setDragOverId(target.dataset.taskId);
        }
    };
    
    const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
        setDragOverId(null);
    };

    const handleDrop = (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        const targetTaskId = e.currentTarget.dataset.taskId;
        const draggedTaskId = e.dataTransfer.getData('taskId');
        if (draggedTaskId && targetTaskId && draggedTaskId !== targetTaskId) {
            onReorderTasks(draggedTaskId, targetTaskId);
        }
        setDragOverId(null);
    };

    const getElapsedTime = useCallback((taskId: string): number => {
        const timer = timers[taskId];
        if (!timer) return 0;
        const accumulated = timer.accumulatedTime;
        const currentRun = timer.isActive && timer.startTime ? Date.now() - timer.startTime : 0;
        return Math.floor((accumulated + currentRun) / 1000);
    }, [timers]);
    
    const pendingTasks = useMemo(() => tasks
        .filter(t => t.status !== 'Completado')
        .filter(t => viewMode === 'mine' ? t.assignedUserId === currentUser.id : true)
        .sort((a, b) => a.priority - b.priority), [tasks, viewMode, currentUser.id]);

    const completedTasks = useMemo(() => tasks
        .filter(t => t.status === 'Completado')
        .filter(t => viewMode === 'mine' ? t.assignedUserId === currentUser.id : true)
        .sort((a, b) => (new Date(b.id.replace('task','')) as any) - (new Date(a.id.replace('task','')) as any)),
    [tasks, viewMode, currentUser.id]);
    
    const selectedRecipeForModal = selectedTask ? recipesById[selectedTask.recipeId] : null;
    const scaledIngredients = useMemo(() => {
        if (!selectedRecipeForModal || !selectedTask) return [];
        const multiplier = selectedTask.quantityToProduce / selectedRecipeForModal.expectedYield;
        return selectedRecipeForModal.ingredients.map(ing => ({ ...ing, quantity: ing.quantity * multiplier }));
    }, [selectedTask, selectedRecipeForModal]);

    const activeFilterClasses = "bg-blue-600 text-white";
    const inactiveFilterClasses = "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600";

    const commonDragProps = (task: ProductionTask) => ({
        'data-task-id': task.id,
        draggable: task.status !== 'Completado',
        onDragStart: (e: React.DragEvent<HTMLElement>) => handleDragStart(e, task.id),
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop,
    });

    return (
        <div className="container mx-auto">
            <GlobalTimer />
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center"><ProductionIcon /><span className="ml-3">Mi Día - Plan de Producción</span></h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Tareas para hoy, {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                     <div className="flex items-center space-x-4">
                        <div className="inline-flex rounded-md shadow-sm" role="group">
                            <button onClick={() => setDisplayMode('board')} className={`p-3 border dark:border-gray-600 rounded-l-lg transition-colors ${displayMode === 'board' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`} aria-label="Vista de tablero">
                                <BoardIcon />
                            </button>
                            <button onClick={() => setDisplayMode('list')} className={`p-3 border dark:border-gray-600 rounded-r-lg transition-colors ${displayMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`} aria-label="Vista de lista">
                                <ListIcon />
                            </button>
                        </div>
                        <button onClick={() => setIsAddTaskModalOpen(true)} className="flex items-center space-x-2 bg-blue-600 text-white font-bold py-3 px-5 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg">
                            <PlusIcon />
                            <span>Agregar Tarea</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mb-4 flex justify-between items-center">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex space-x-4" aria-label="Tabs">
                        <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 font-medium text-lg rounded-t-md ${activeTab === 'pending' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                            Tareas Pendientes ({pendingTasks.length})
                        </button>
                        <button onClick={() => setActiveTab('completed')} className={`px-4 py-2 font-medium text-lg rounded-t-md ${activeTab === 'completed' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                            Tareas Completadas ({completedTasks.length})
                        </button>
                    </nav>
                </div>
                {currentUser.role === Role.Produccion && (
                    <div className="inline-flex rounded-md shadow-sm" role="group">
                        <button onClick={() => setViewMode('all')} className={`py-2 px-4 text-sm font-medium rounded-l-lg border dark:border-gray-600 ${viewMode === 'all' ? activeFilterClasses : inactiveFilterClasses}`}>Todas las Tareas</button>
                        <button onClick={() => setViewMode('mine')} className={`py-2 px-4 text-sm font-medium rounded-r-md border dark:border-gray-600 ${viewMode === 'mine' ? activeFilterClasses : inactiveFilterClasses}`}>Mis Tareas</button>
                    </div>
                )}
            </div>

            {displayMode === 'list' ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                         {activeTab === 'pending' && (
                            <table className="w-full text-base text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-sm text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th scope="col" className="px-1 py-3 w-8"></th>
                                        <th scope="col" className="px-6 py-3">Prioridad</th>
                                        <th scope="col" className="px-6 py-3">Receta</th>
                                        <th scope="col" className="px-6 py-3">Cantidad</th>
                                        <th scope="col" className="px-6 py-3">Asignado a</th>
                                        <th scope="col" className="px-6 py-3">Estado</th>
                                        <th scope="col" className="px-6 py-3">Tiempo / Controles</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingTasks.map(task => {
                                        const assignedUserName = usersById.get(task.assignedUserId!)?.name;
                                        return (
                                        <tr key={task.id} {...commonDragProps(task)} className={`bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 ${task.status !== 'Completado' ? 'cursor-move' : ''} transition-all duration-200 ${dragOverId === task.id ? 'outline-2 outline-dashed outline-blue-500 relative' : ''}`}>
                                            <td className="px-1 py-4 text-center text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200">
                                              {task.status !== 'Completado' && <GripVerticalIcon className="h-5 w-5 inline-block" />}
                                            </td>
                                            <td className="px-6 py-4"><span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 text-sm font-medium px-2.5 py-0.5 rounded-full">{task.priority}</span></td>
                                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap"><Link to={`/recetas/${task.recipeId}`} className="text-blue-600 dark:text-blue-400 hover:underline">{task.recipeName}</Link></th>
                                            <td className="px-6 py-4">{task.quantityToProduce} {task.unit}</td>
                                            <td className="px-6 py-4">
                                                {currentUser.role === Role.Admin ? (
                                                    <select value={task.assignedUserId || ''} onChange={(e) => handleAssignmentChange(task.id, e.target.value)} className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm w-full max-w-[150px]">
                                                        <option value="">Sin asignar</option>
                                                        {productionUsers.map(user => (<option key={user.id} value={user.id}>{user.name}</option>))}
                                                    </select>
                                                ) : (
                                                    <span className="flex items-center space-x-2">{assignedUserName ? <><AssignUserIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" /><span>{assignedUserName}</span></> : <span className="text-gray-400 dark:text-gray-500 italic">Sin asignar</span>}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4"><span className={`text-sm font-semibold px-2.5 py-1 rounded-full ${getStatusClasses(task.status)}`}>{task.status}</span></td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center justify-start space-x-3">
                                                    <div className="flex items-center rounded-md px-3 py-2" aria-live="off"><TimerIcon /><span className={`font-mono text-lg ml-2`}>{formatTime(getElapsedTime(task.id))}</span></div>
                                                    <div className="flex items-center space-x-2">
                                                        {!(timers[task.id]?.isActive) ? (<button onClick={() => timers[task.id] ? handleResume(task.id) : handleStart(task.id)} className={`${baseButtonClasses} bg-green-500 hover:bg-green-600 focus:ring-green-500 text-sm`}>{timers[task.id] ? 'Reanudar' : 'Iniciar'}</button>) : (<button onClick={() => handlePause(task.id)} className={`${baseButtonClasses} bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500 text-sm`}>Pausar</button>)}
                                                        {timers[task.id] && (<button onClick={() => handleProduceClick(task)} className={`${baseButtonClasses} bg-blue-600 hover:bg-blue-700 focus:ring-blue-600 text-sm`}><PlayIcon/><span>Producir</span></button>)}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )})}
                                </tbody>
                            </table>
                         )}
                         {activeTab === 'completed' && (
                            <table className="w-full text-base text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-sm text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                                    <tr><th scope="col" className="px-6 py-3">Receta</th><th scope="col" className="px-6 py-3">Cantidad Producida</th><th scope="col" className="px-6 py-3">Asignado a</th><th scope="col" className="px-6 py-3">Estado</th></tr>
                                </thead>
                                <tbody>
                                    {completedTasks.map(task => {
                                        const assignedUserName = usersById.get(task.assignedUserId!)?.name;
                                        return (
                                        <tr key={task.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700"><th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white">{task.recipeName}</th><td className="px-6 py-4">{task.quantityToProduce} {task.unit}</td><td className="px-6 py-4"><span className="flex items-center space-x-2">{assignedUserName ? <><AssignUserIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" /><span>{assignedUserName}</span></> : <span className="text-gray-400 dark:text-gray-500 italic">Sin asignar</span>}</span></td><td className="px-6 py-4"><span className={`text-sm font-semibold px-2.5 py-1 rounded-full ${getStatusClasses(task.status)}`}>{task.status}</span></td></tr>
                                    )})}
                                </tbody>
                            </table>
                        )}
                    </div>
                    {((activeTab === 'pending' && pendingTasks.length === 0) || (activeTab === 'completed' && completedTasks.length === 0)) && (<p className="text-center text-gray-500 py-20">No hay tareas en esta sección.</p>)}
                </div>
            ) : (
                <div>
                    {activeTab === 'pending' ? (
                        pendingTasks.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                                {pendingTasks.map(task => (
                                    <ProductionTaskCard key={task.id} task={task} timer={timers[task.id]} elapsedTime={getElapsedTime(task.id)} assignedUserName={usersById.get(task.assignedUserId!)?.name} onStart={() => handleStart(task.id)} onPause={() => handlePause(task.id)} onResume={() => handleResume(task.id)} onProduce={() => handleProduceClick(task)} commonDragProps={commonDragProps(task)} isDragOver={dragOverId === task.id} />
                                ))}
                            </div>
                        ) : <p className="text-center text-gray-500 py-20">No hay tareas pendientes.</p>
                    ) : (
                         completedTasks.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                                {completedTasks.map(task => (
                                    <ProductionTaskCard key={task.id} task={task} timer={timers[task.id]} elapsedTime={getElapsedTime(task.id)} assignedUserName={usersById.get(task.assignedUserId!)?.name} onStart={() => {}} onPause={() => {}} onResume={() => {}} onProduce={() => {}} commonDragProps={{}} isDragOver={false} />
                                ))}
                            </div>
                        ) : <p className="text-center text-gray-500 py-20">No hay tareas completadas.</p>
                    )}
                </div>
            )}
            
            {/* Production Modal */}
            {isProduceModalOpen && selectedTask && selectedRecipeForModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={() => setIsProduceModalOpen(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b dark:border-gray-700"><h2 className="text-2xl font-bold text-gray-800 dark:text-white">Producir: {selectedRecipeForModal.name}</h2><p className="text-gray-600 dark:text-gray-400">Cantidad planeada: {selectedTask.quantityToProduce} {selectedTask.unit}</p></div>
                        <div className="p-6 overflow-y-auto flex-grow">
                            <div className="mb-6"><h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center"><YieldIcon /><span className="ml-2">Ingredientes Requeridos</span></h3><ul className="space-y-2 list-disc list-inside bg-gray-50 dark:bg-gray-700 p-4 rounded-md text-gray-600 dark:text-gray-300 max-h-60 overflow-y-auto">{scaledIngredients.map(ing => (<li key={ing.ingredientId}><span className="font-semibold">{ing.ingredientName}:</span> {ing.quantity.toFixed(2)} {ing.unit}</li>))}</ul></div>
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="producer-select" className="block text-lg font-semibold text-gray-700 dark:text-gray-300">¿Quién realizó esta producción?</label>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Selecciona tu nombre de la lista.</p>
                                    <select id="producer-select" value={selectedProducerName} onChange={e => setSelectedProducerName(e.target.value)} className="mt-1 block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-lg">{productionUsers.map(user => (<option key={user.id} value={user.name}>{user.name}</option>))} </select>
                                </div>
                                <div>
                                  <label htmlFor="actualYield" className="block text-lg font-semibold text-gray-700 dark:text-gray-300">Confirmar Rendimiento Real</label><p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Ajusta la cantidad final que obtuviste.</p><div className="mt-1 flex rounded-md shadow-sm"><input type="number" id="actualYield" value={modalYield} onChange={e => setModalYield(parseFloat(e.target.value) || 0)} className="flex-1 block w-full rounded-none rounded-l-md sm:text-lg border-gray-300 dark:border-gray-600 p-3 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"/><span className="inline-flex items-center px-4 rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-300 text-lg">{selectedRecipeForModal.yieldUnit}</span></div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 rounded-b-lg flex justify-end space-x-4">
                            <button onClick={() => setIsProduceModalOpen(false)} className="px-6 py-3 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition">Cancelar</button>
                            <button onClick={handleConfirmProduction} className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition">Confirmar y Generar Lote</button>
                        </div>
                    </div>
                </div>
            )}
             {/* Add Task Modal */}
            {isAddTaskModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={() => setIsAddTaskModalOpen(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b dark:border-gray-700"><h2 className="text-2xl font-bold text-gray-800 dark:text-white">Agregar Nueva Tarea de Producción</h2></div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="recipe-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">1. Busca y selecciona una receta</label>
                                <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" /></div><input id="recipe-search" type="text" placeholder="Escribe para buscar..." value={addTaskSearchTerm} onChange={e => { setAddTaskSearchTerm(e.target.value); setNewTaskRecipeId(null); }} className="mt-1 block w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700" /></div>
                                {addTaskSearchTerm && (
                                    <ul className="mt-2 border border-gray-300 dark:border-gray-600 rounded-md max-h-40 overflow-y-auto bg-white dark:bg-gray-700 z-10">
                                        {filteredRecipesForModal.length > 0 ? filteredRecipesForModal.map(recipe => ( <li key={recipe.id} onClick={() => { setNewTaskRecipeId(recipe.id); setAddTaskSearchTerm(recipe.name); }} className={`p-3 cursor-pointer ${ newTaskRecipeId === recipe.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-600' }`} > {recipe.name} </li> )) : <li className="p-3 text-gray-500 dark:text-gray-400">No se encontraron recetas.</li>}
                                    </ul>
                                )}
                            </div>
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">2. Introduce la cantidad a producir</label>
                                <div className="mt-1 flex rounded-md shadow-sm"><input type="number" id="quantity" value={newTaskQuantity} onChange={e => setNewTaskQuantity(e.target.value === '' ? '' : parseFloat(e.target.value))} className="flex-1 block w-full p-3 border-gray-300 dark:border-gray-600 rounded-l-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700" min="0" disabled={!newTaskRecipeId} /><span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-300">{newTaskRecipeId ? recipesById[newTaskRecipeId]?.yieldUnit : 'unidades'}</span></div>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 flex justify-end space-x-4">
                            <button onClick={() => setIsAddTaskModalOpen(false)} className="px-6 py-3 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition">Cancelar</button>
                            <button onClick={handleAddNewTask} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition" disabled={!newTaskRecipeId || !newTaskQuantity}>Agregar Tarea</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

interface ProductionTaskCardProps {
    task: ProductionTask;
    timer: { startTime: number | null; accumulatedTime: number; isActive: boolean; } | undefined;
    elapsedTime: number;
    assignedUserName?: string;
    onStart: () => void;
    onPause: () => void;
    onResume: () => void;
    onProduce: () => void;
    commonDragProps: any;
    isDragOver: boolean;
}

const ProductionTaskCard: React.FC<ProductionTaskCardProps> = ({ task, timer, elapsedTime, assignedUserName, onStart, onPause, onResume, onProduce, commonDragProps, isDragOver }) => {
    const isTimerActive = timer?.isActive;
    const hasTimerStarted = timer && (timer.accumulatedTime > 0 || timer.isActive);

    return (
        <div {...commonDragProps} className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700 p-5 flex flex-col space-y-4 relative ${task.status !== 'Completado' ? 'cursor-move' : ''} transition-all duration-200 ${isDragOver ? 'outline-2 outline-dashed outline-blue-500' : ''}`}>
            <div className="flex justify-between items-start">
                <Link to={`/recetas/${task.recipeId}`} className="font-bold text-lg text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 pr-12">{task.recipeName}</Link>
                {task.status !== 'Completado' && <span className="absolute top-4 right-4 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 text-sm font-medium px-2.5 py-0.5 rounded-full">{task.priority}</span>}
            </div>
            
            <p className="text-base text-gray-600 dark:text-gray-400">{task.quantityToProduce} {task.unit}</p>

            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                <AssignUserIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                <span>{assignedUserName || <span className="italic">Sin asignar</span>}</span>
            </div>
            
            <div className="flex-grow"></div>
            
            <div className="border-t dark:border-gray-700 pt-4">
                <div className="flex items-center justify-center text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
                    <TimerIcon className="text-gray-500 dark:text-gray-400 h-6 w-6"/>
                    <span className="font-mono text-3xl ml-3 text-gray-800 dark:text-white" aria-live="off">{formatTime(elapsedTime)}</span>
                </div>

                {task.status !== 'Completado' ? (
                    <div className="flex items-center space-x-2">
                        {!isTimerActive ? (
                            <button onClick={hasTimerStarted ? onResume : onStart} className={`${baseButtonClasses} flex-1 bg-green-500 hover:bg-green-600 focus:ring-green-500`}>{hasTimerStarted ? 'Reanudar' : 'Iniciar'}</button>
                        ) : (
                            <button onClick={onPause} className={`${baseButtonClasses} flex-1 bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500`}>Pausar</button>
                        )}
                        {hasTimerStarted && (
                            <button onClick={onProduce} className={`${baseButtonClasses} bg-blue-600 hover:bg-blue-700 focus:ring-blue-600`}><PlayIcon/><span>Producir</span></button>
                        )}
                    </div>
                ) : (
                     <div className="text-center">
                        <span className={`text-base font-semibold px-4 py-2 rounded-full ${getStatusClasses(task.status)}`}>{task.status}</span>
                     </div>
                )}
            </div>
        </div>
    );
};

export default ProductionPlan;
