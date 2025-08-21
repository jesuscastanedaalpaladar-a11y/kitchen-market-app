import React, { useState } from 'react';
import { OperationalTaskTemplate, TaskFrequency, Role } from '../types';
import { ChecklistIcon } from './icons';

interface OperationalTaskAdminProps {
    templates: OperationalTaskTemplate[];
    onAddTaskTemplate: (templateData: Omit<OperationalTaskTemplate, 'id'>) => void;
}

const OperationalTaskAdmin: React.FC<OperationalTaskAdminProps> = ({ templates, onAddTaskTemplate }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [frequency, setFrequency] = useState<TaskFrequency>(TaskFrequency.Diaria);
    const [assignedRole, setAssignedRole] = useState<Role.Produccion | Role.Servicio>(Role.Produccion);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !description.trim()) {
            alert('Por favor, completa el nombre y la descripción.');
            return;
        }
        onAddTaskTemplate({ name, description, frequency, assignedRole });
        setName('');
        setDescription('');
    };
    
    return (
        <div className="container mx-auto space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <ChecklistIcon />
                    <span className="ml-3">Gestión de Tareas Operativas</span>
                </h1>
                <p className="text-gray-600 mt-2">Crea y administra las plantillas para las tareas recurrentes del checklist.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm space-y-4">
                        <h2 className="text-xl font-bold text-gray-700">Añadir Nueva Tarea</h2>
                        <div>
                            <label htmlFor="task-name" className="block text-sm font-medium text-gray-700">Nombre</label>
                            <input type="text" id="task-name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
                        </div>
                        <div>
                            <label htmlFor="task-desc" className="block text-sm font-medium text-gray-700">Descripción</label>
                            <textarea id="task-desc" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" required></textarea>
                        </div>
                        <div>
                            <label htmlFor="task-freq" className="block text-sm font-medium text-gray-700">Frecuencia</label>
                            <select id="task-freq" value={frequency} onChange={e => setFrequency(e.target.value as TaskFrequency)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white">
                                {Object.values(TaskFrequency).map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="task-role" className="block text-sm font-medium text-gray-700">Rol Asignado</label>
                            <select id="task-role" value={assignedRole} onChange={e => setAssignedRole(e.target.value as Role.Produccion | Role.Servicio)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white">
                                <option value={Role.Produccion}>Producción</option>
                                <option value={Role.Servicio}>Servicio</option>
                            </select>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">
                            Guardar Tarea
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-700">Plantillas Existentes</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3">Nombre</th>
                                    <th className="px-6 py-3">Frecuencia</th>
                                    <th className="px-6 py-3">Rol</th>
                                </tr>
                            </thead>
                            <tbody>
                                {templates.map(template => (
                                    <tr key={template.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{template.name}</td>
                                        <td className="px-6 py-4">{template.frequency}</td>
                                        <td className="px-6 py-4"><span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{template.assignedRole}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperationalTaskAdmin;
