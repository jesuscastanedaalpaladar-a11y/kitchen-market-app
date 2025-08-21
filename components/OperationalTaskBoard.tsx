import React, { useState } from 'react';
import { OperationalTask, TaskStatus } from '../types';
import { ChecklistIcon, BoardIcon, ListIcon, GripVerticalIcon } from './icons';

interface OperationalTaskBoardProps {
    tasks: OperationalTask[];
    onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
    title: string;
    onReorderTasks: (draggedId: string, targetId: string) => void;
}

const getStatusColorClasses = (status: TaskStatus) => {
    switch (status) {
        case TaskStatus.Pendiente: return 'border-yellow-500';
        case TaskStatus.EnProgreso: return 'border-blue-500';
        case TaskStatus.Completado: return 'border-green-500';
        default: return 'border-gray-500';
    }
};

const TaskActions: React.FC<{ task: OperationalTask; onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void; context: 'list' | 'board' }> = ({ task, onUpdateTaskStatus, context }) => {
    const baseButtonClasses = "text-xs font-semibold px-3 py-1 rounded-md transition-colors";

    if (task.status === TaskStatus.Pendiente) {
        return (
            <button onClick={() => onUpdateTaskStatus(task.id, TaskStatus.EnProgreso)} className={`${baseButtonClasses} bg-blue-500 text-white hover:bg-blue-600`}>
                Empezar {context === 'list' && '→'}
            </button>
        );
    }
    if (task.status === TaskStatus.EnProgreso) {
        return (
            <div className="flex space-x-2">
                <button onClick={() => onUpdateTaskStatus(task.id, TaskStatus.Pendiente)} className={`${baseButtonClasses} bg-gray-200 text-gray-700 hover:bg-gray-300`}>
                    {context === 'list' && '←'} Devolver
                </button>
                <button onClick={() => onUpdateTaskStatus(task.id, TaskStatus.Completado)} className={`${baseButtonClasses} bg-green-500 text-white hover:bg-green-600`}>
                    Completar {context === 'list' && '→'}
                </button>
            </div>
        );
    }
    if (task.status === TaskStatus.Completado) {
        return (
            <button onClick={() => onUpdateTaskStatus(task.id, TaskStatus.EnProgreso)} className={`${baseButtonClasses} bg-yellow-500 text-white hover:bg-yellow-600`}>
                {context === 'list' && '←'} Reabrir
            </button>
        );
    }
    return null;
};


const TaskCard: React.FC<{ 
    task: OperationalTask; 
    onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
    commonDragProps: any;
    isDragOver: boolean;
}> = ({ task, onUpdateTaskStatus, commonDragProps, isDragOver }) => {
    return (
        <div 
            {...commonDragProps}
            className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-3 transition-shadow hover:shadow-md cursor-move ${isDragOver ? 'outline-2 outline-dashed outline-blue-500' : ''}`}
        >
            <h4 className="font-bold text-gray-800">{task.name}</h4>
            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
            <div className="mt-4 flex justify-between items-center">
                <TaskActions task={task} onUpdateTaskStatus={onUpdateTaskStatus} context="board" />
            </div>
        </div>
    );
};

const BoardColumn: React.FC<{ 
    title: string; 
    tasks: OperationalTask[]; 
    status: TaskStatus;
    children: React.ReactNode;
}> = ({ title, tasks, status, children }) => {
    const colorClass = getStatusColorClasses(status);
    return (
        <div className="bg-gray-50 rounded-lg p-4 flex-1 min-h-[200px]">
            <h3 className={`font-bold text-lg mb-4 pb-2 border-b-2 ${colorClass}`}>
                {title} <span className="text-sm font-normal text-gray-500">({tasks.length})</span>
            </h3>
            <div>
                {children}
            </div>
        </div>
    );
};

const TaskRow: React.FC<{
    task: OperationalTask;
    onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
    commonDragProps: any;
    isDragOver: boolean;
}> = ({ task, onUpdateTaskStatus, commonDragProps, isDragOver }) => {
    const isDraggable = task.status !== TaskStatus.Completado;
    return (
        <tr
            {...commonDragProps}
            className={`bg-white border-b hover:bg-gray-50 ${isDraggable ? 'cursor-move' : ''} transition-all duration-200 ${isDragOver ? 'outline-2 outline-dashed outline-blue-500 relative' : ''}`}
        >
            <td className="px-1 py-4 text-center text-gray-400 hover:text-gray-700 w-8">
                {isDraggable && <GripVerticalIcon className="h-5 w-5 inline-block" />}
            </td>
            <th scope="row" className="px-6 py-4 font-medium text-gray-900">{task.name}</th>
            <td className="px-6 py-4 text-gray-600">{task.description}</td>
            <td className="px-6 py-4 text-right">
                <TaskActions task={task} onUpdateTaskStatus={onUpdateTaskStatus} context="list" />
            </td>
        </tr>
    );
};

const TaskTable: React.FC<{
    title: string;
    tasks: OperationalTask[];
    status: TaskStatus;
    onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
    commonDragProps: (task: OperationalTask) => any;
    dragOverId: string | null;
}> = ({ title, tasks, status, onUpdateTaskStatus, commonDragProps, dragOverId }) => {
    if (tasks.length === 0) return null;
    const colorClass = getStatusColorClasses(status);
    return (
        <div className="mb-8">
            <h3 className={`font-bold text-xl mb-3 pb-2 border-b-2 ${colorClass}`}>
                {title} <span className="text-base font-normal text-gray-500">({tasks.length})</span>
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-1 py-3 w-8"></th>
                            <th scope="col" className="px-6 py-3">Tarea</th>
                            <th scope="col" className="px-6 py-3">Descripción</th>
                            <th scope="col" className="px-6 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map(task => (
                            <TaskRow 
                                key={task.id}
                                task={task}
                                onUpdateTaskStatus={onUpdateTaskStatus}
                                commonDragProps={commonDragProps(task)}
                                isDragOver={dragOverId === task.id}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const OperationalTaskBoard: React.FC<OperationalTaskBoardProps> = ({ tasks, onUpdateTaskStatus, title, onReorderTasks }) => {
    const [dragOverId, setDragOverId] = useState<string | null>(null);
    const [displayMode, setDisplayMode] = useState<'board' | 'list'>('board');
    
    const pendingTasks = tasks.filter(t => t.status === TaskStatus.Pendiente);
    const inProgressTasks = tasks.filter(t => t.status === TaskStatus.EnProgreso);
    const completedTasks = tasks.filter(t => t.status === TaskStatus.Completado);

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
    
    const handleDragLeave = () => {
        setDragOverId(null);
    };

    const handleDrop = (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        const targetTaskId = e.currentTarget.dataset.taskId;
        const draggedTaskId = e.dataTransfer.getData('taskId');
        
        const draggedTask = tasks.find(t => t.id === draggedTaskId);
        const targetTask = tasks.find(t => t.id === targetTaskId);

        // Only allow reordering within the same status column
        if (draggedTaskId && targetTaskId && draggedTask && targetTask && draggedTask.status === targetTask.status) {
            onReorderTasks(draggedTaskId, targetTaskId);
        }
        setDragOverId(null);
    };
    
    const commonDragProps = (task: OperationalTask) => ({
        'data-task-id': task.id,
        draggable: task.status !== TaskStatus.Completado,
        onDragStart: (e: React.DragEvent<HTMLElement>) => handleDragStart(e, task.id),
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop,
    });
    
    const renderTaskCards = (taskList: OperationalTask[]) => {
        if (taskList.length === 0) {
             return <p className="text-sm text-gray-400 text-center py-4">No hay tareas aquí.</p>;
        }
        return taskList.map(task => 
            <TaskCard 
                key={task.id} 
                task={task} 
                onUpdateTaskStatus={onUpdateTaskStatus} 
                commonDragProps={commonDragProps(task)}
                isDragOver={dragOverId === task.id}
            />
        );
    }

    return (
        <div className="container mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                            <ChecklistIcon />
                            <span className="ml-3">{title}</span>
                        </h1>
                        <p className="text-gray-600 mt-2">Gestiona las tareas operativas del día.</p>
                    </div>
                    <div className="inline-flex rounded-md shadow-sm" role="group">
                        <button onClick={() => setDisplayMode('list')} className={`p-2 border rounded-l-lg transition-colors ${displayMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`} aria-label="Vista de lista">
                            <ListIcon />
                        </button>
                        <button onClick={() => setDisplayMode('board')} className={`p-2 border rounded-r-lg transition-colors ${displayMode === 'board' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`} aria-label="Vista de tablero">
                            <BoardIcon />
                        </button>
                    </div>
                </div>
            </div>
            
            {displayMode === 'board' ? (
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                    <BoardColumn title="Pendiente" tasks={pendingTasks} status={TaskStatus.Pendiente}>
                        {renderTaskCards(pendingTasks)}
                    </BoardColumn>
                    <BoardColumn title="En Progreso" tasks={inProgressTasks} status={TaskStatus.EnProgreso}>
                        {renderTaskCards(inProgressTasks)}
                    </BoardColumn>
                    <BoardColumn title="Completado" tasks={completedTasks} status={TaskStatus.Completado}>
                        {renderTaskCards(completedTasks)}
                    </BoardColumn>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <TaskTable 
                        title="Pendiente"
                        tasks={pendingTasks}
                        status={TaskStatus.Pendiente}
                        onUpdateTaskStatus={onUpdateTaskStatus}
                        commonDragProps={commonDragProps}
                        dragOverId={dragOverId}
                    />
                    <TaskTable 
                        title="En Progreso"
                        tasks={inProgressTasks}
                        status={TaskStatus.EnProgreso}
                        onUpdateTaskStatus={onUpdateTaskStatus}
                        commonDragProps={commonDragProps}
                        dragOverId={dragOverId}
                    />
                    <TaskTable 
                        title="Completado"
                        tasks={completedTasks}
                        status={TaskStatus.Completado}
                        onUpdateTaskStatus={onUpdateTaskStatus}
                        commonDragProps={commonDragProps}
                        dragOverId={dragOverId}
                    />
                     {tasks.length === 0 && <p className="text-center text-gray-500 py-10">No hay tareas operativas para hoy.</p>}
                </div>
            )}
        </div>
    );
};

export default OperationalTaskBoard;