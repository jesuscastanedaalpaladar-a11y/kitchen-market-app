
import React, { useState, useMemo } from 'react';
import { ProductionTask, Recipe, OperationalTask, Role, TaskStatus, User } from '../types';
import { RecipeIcon, ProductionIcon, ChecklistIcon, PlusIcon } from './icons';

interface ManagerDashboardProps {
    currentUser: User;
    tasks: ProductionTask[];
    recipes: Recipe[];
    users: User[];
    operationalTasks: OperationalTask[];
    onAddTask: (recipeId: string, quantity: number) => void;
    onUpdateOperationalTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ currentUser, tasks, recipes, users, operationalTasks, onAddTask, onUpdateOperationalTaskStatus }) => {
    
    const usersById = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
    
    const supervisionTasks = useMemo(() => 
        operationalTasks.filter(t => t.assignedRole === currentUser.role && t.status !== TaskStatus.Completado),
        [operationalTasks, currentUser.role]
    );

    const teamProductionTasks = useMemo(() => tasks.filter(t => t.status !== 'Completado'), [tasks]);
    const teamOperationalTasks = useMemo(() => 
        operationalTasks.filter(t => t.assignedRole !== currentUser.role && t.status !== 'Completado'),
        [operationalTasks, currentUser.role]
    );

    const [recipeId, setRecipeId] = useState('');
    const [quantity, setQuantity] = useState('');

    const handleScheduleTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (recipeId && quantity) {
            onAddTask(recipeId, Number(quantity));
            setRecipeId('');
            setQuantity('');
        } else {
            alert('Por favor, selecciona una receta y especifica una cantidad.');
        }
    };
    
    return (
        <div className="container mx-auto space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Superviso Hoy</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Panel de control para Managers y Chefs de Sucursal.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-6">
                    {/* Progreso del Equipo */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
                            <ProductionIcon /><span className="ml-2">Progreso del Equipo</span>
                        </h2>
                        {teamProductionTasks.length > 0 ? (
                             <ul className="space-y-3">
                                {teamProductionTasks.slice(0, 5).map(task => {
                                    const assignedUserName = usersById.get(task.assignedUserId!)?.name;
                                    return (
                                    <li key={task.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">{task.recipeName}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{task.quantityToProduce} {task.unit} - {assignedUserName || 'Sin asignar'}</p>
                                        </div>
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${task.status === 'Completado' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'}`}>{task.status}</span>
                                    </li>
                                )})}
                            </ul>
                        ) : <p className="text-gray-500 dark:text-gray-400">No hay tareas de producción activas para el equipo.</p>}
                        
                        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 my-4 flex items-center">
                            <ChecklistIcon /><span className="ml-2">Checklists del Equipo</span>
                        </h3>
                         {teamOperationalTasks.length > 0 ? (
                             <ul className="space-y-3">
                                {teamOperationalTasks.slice(0, 5).map(task => (
                                    <li key={task.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">{task.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{task.assignedRole}</p>
                                        </div>
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${task.status === 'Completado' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : task.status === 'En Progreso' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'}`}>{task.status}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-gray-500 dark:text-gray-400">No hay tareas de checklist activas para el equipo.</p>}
                    </div>
                </div>

                <div className="space-y-6 lg:sticky top-6">
                     {/* Tareas de Supervisión */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                         <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
                            <ChecklistIcon /><span className="ml-2">Mis Tareas</span>
                        </h2>
                        {supervisionTasks.length > 0 ? (
                            <ul className="space-y-3">
                                {supervisionTasks.map(task => (
                                    <li key={task.id} className="p-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 rounded-md">
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{task.name}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                                        <div className="mt-3 text-right">
                                            {task.status !== 'Completado' && (
                                                <button onClick={() => onUpdateOperationalTaskStatus(task.id, TaskStatus.Completado)} className="text-xs font-bold text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded-full shadow">Marcar como Completado</button>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-gray-500 dark:text-gray-400">No tienes tareas de supervisión para hoy.</p>}
                    </div>
                    {/* Programar Tarea */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
                            <RecipeIcon /><span className="ml-2">Programar Tarea</span>
                        </h2>
                        <form onSubmit={handleScheduleTask} className="space-y-4">
                             <div>
                                <label htmlFor="recipe-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Receta</label>
                                <select id="recipe-select" value={recipeId} onChange={e => setRecipeId(e.target.value)} required className="mt-1 block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700">
                                    <option value="" disabled>Selecciona...</option>
                                    {recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cantidad</label>
                                <input type="number" id="quantity" value={quantity} onChange={e => setQuantity(e.target.value)} required min="0" className="mt-1 block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700" />
                            </div>
                            <button type="submit" className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 shadow-lg">
                                <PlusIcon/>
                                <span>Añadir a Producción</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
