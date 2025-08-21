import React from 'react';
import { User, Role, ProductionTask, Recipe, OperationalTask, TaskStatus } from '../types';
import ProductionPlan from './ProductionPlan';
import ManagerDashboard from './ManagerDashboard';
import KitchenTeamDashboard from './KitchenTeamDashboard';
import AdminMyDayView from './AdminMyDayView';

interface MyDayViewProps {
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

const MyDayView: React.FC<MyDayViewProps> = (props) => {
    const { currentUser, onReorderProductionTasks } = props;

    switch (currentUser.role) {
        case Role.Admin:
            return <AdminMyDayView {...props} />;
        case Role.Cocina: // Manager/Chef role
            return <ManagerDashboard {...props} />;
        case Role.Produccion:
            return <ProductionPlan {...props} onReorderTasks={onReorderProductionTasks} />;
        case Role.Servicio:
            return <KitchenTeamDashboard {...props} />;
        default:
            return <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm">Vista no configurada para este rol.</div>;
    }
};

export default MyDayView;