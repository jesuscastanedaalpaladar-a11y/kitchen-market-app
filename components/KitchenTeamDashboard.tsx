import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { User, ProductionTask, OperationalTask, TaskStatus } from '../types';
import { CalculatorIcon, ChecklistIcon } from './icons';

interface KitchenTeamDashboardProps {
    currentUser: User;
    tasks: ProductionTask[];
    operationalTasks: OperationalTask[];
    onUpdateOperationalTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
}

const isProductionTask = (task: ProductionTask | OperationalTask): task is ProductionTask => {
    return 'recipeName' in task;
}

const KitchenTeamDashboard: React.FC<KitchenTeamDashboardProps> = ({ currentUser, tasks, operationalTasks, onUpdateOperationalTaskStatus }) => {

    const myProductionTasks = useMemo(() => 
        tasks.filter(t => t.assignedUserId === currentUser.id && t.status !== 'Completado'),
        [tasks, currentUser.id]
    );
    
    const myOperationalTasks = useMemo(() => 
        operationalTasks.filter(t => t.assignedRole === currentUser.role && t.status !== 'Completado'),
        [operationalTasks, currentUser.role]
    );

    const allMyTasks = useMemo(() => 
        [...myProductionTasks, ...myOperationalTasks]
            .sort((a, b) => ('priority' in a ? a.priority : Infinity) - ('priority' in b ? b.priority : Infinity)),
        [myProductionTasks, myOperationalTasks]
    );

    return (
        <div className="container mx-auto space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mi Día</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Tus tareas de ejecución para hoy.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4">Lista de Pendientes ({allMyTasks.length})</h2>
                    {allMyTasks.length > 0 ? (
                        <ul className="space-y-4">
                            {allMyTasks.map(task => {
                                const isProdTask = isProductionTask(task);
                                const taskName = isProdTask ? task.recipeName : task.name;
                                const taskDescription = isProdTask ? `Producir: ${task.quantityToProduce} ${task.unit}` : task.description;
                                
                                return (
                                    <li key={task.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-lg text-gray-800 dark:text-gray-200">{taskName}</p>
                                                <p className="text-base text-gray-500 dark:text-gray-400">{taskDescription}</p>
                                            </div>
                                            {isProdTask ? (
                                                <Link to="/produccion" className="text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-full shadow">Ir a Producción</Link>
                                            ) : (
                                                <button onClick={() => onUpdateOperationalTaskStatus(task.id, TaskStatus.Completado)} className="text-base font-bold text-white bg-green-500 hover:bg-green-600 px-4 py-2 rounded-full shadow">Completar</button>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="text-center py-16">
                             <span className="text-5xl">🎉</span>
                            <p className="text-gray-500 dark:text-gray-400 text-xl mt-4">¡Felicidades! No tienes tareas pendientes.</p>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1 space-y-4 lg:sticky top-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
                        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4">Herramientas</h2>
                        <div className="space-y-4">
                             <Link to="/checklist-servicio" className="w-full flex items-center justify-center space-x-3 p-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-lg text-lg">
                                <ChecklistIcon />
                                <span>Mi Checklist</span>
                            </Link>
                             <Link to="/calculadora" className="w-full flex items-center justify-center space-x-3 p-4 bg-gray-700 dark:bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-500 transition-all shadow-lg text-lg">
                                <CalculatorIcon />
                                <span>Calculadora</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KitchenTeamDashboard;