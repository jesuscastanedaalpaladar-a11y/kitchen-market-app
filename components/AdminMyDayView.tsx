import React, { useState } from 'react';
import { User, ProductionTask, Recipe, OperationalTask, TaskStatus, Role } from '../types';
import ProductionPlan from './ProductionPlan';
import ManagerDashboard from './ManagerDashboard';
import KitchenTeamDashboard from './KitchenTeamDashboard';

interface AdminMyDayViewProps {
    currentUser: User;
    tasks: ProductionTask[];
    recipes: Recipe[];
    users: User[];
    operationalTasks: OperationalTask[];
    onAddTask: (recipeId: string, quantity: number) => void;
    onCompleteTaskAndAddBatch: (task: ProductionTask, recipe: Recipe, actualYield: number, duration: number, producerName: string) => void;
    onAssignTask: (taskId: string, userId: number | null) => void;
    onReorderProductionTasks: (draggedId: string, targetId: string) => void;
    onUpdateOperationalTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
    onReorderOperationalTasks: (draggedId: string, targetId: string) => void;
}

type ViewAsRole = 'Manager' | 'Producción' | 'Equipo Cocina';

const AdminMyDayView: React.FC<AdminMyDayViewProps> = (props) => {
    const [viewAs, setViewAs] = useState<ViewAsRole>('Manager');

    const renderView = () => {
        const managerUser: User = { ...props.currentUser, role: Role.Cocina };
        const productionUser: User = { ...props.currentUser, role: Role.Produccion };
        const kitchenUser: User = { ...props.currentUser, role: Role.Servicio };

        switch (viewAs) {
            case 'Manager':
                return <ManagerDashboard {...props} currentUser={managerUser} />;
            case 'Producción':
                return <ProductionPlan {...props} currentUser={productionUser} onReorderTasks={props.onReorderProductionTasks} />;
            case 'Equipo Cocina':
                return <KitchenTeamDashboard {...props} currentUser={kitchenUser} />;
            default:
                return null;
        }
    };

    const tabClasses = (role: ViewAsRole) => 
        `px-4 py-2 font-medium text-sm rounded-md cursor-pointer transition-colors ${
            viewAs === role 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`;

    return (
        <div className="container mx-auto">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vista de "Mi Día" (Admin)</h1>
                    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 mr-2">Ver como:</span>
                        <button onClick={() => setViewAs('Manager')} className={tabClasses('Manager')}>{Role.Cocina}</button>
                        <button onClick={() => setViewAs('Producción')} className={tabClasses('Producción')}>{Role.Produccion}</button>
                        <button onClick={() => setViewAs('Equipo Cocina')} className={tabClasses('Equipo Cocina')}>{Role.Servicio}</button>
                    </div>
                </div>
            </div>
            <div className="mt-4">
                {renderView()}
            </div>
        </div>
    );
};

export default AdminMyDayView;