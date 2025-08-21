import React from 'react';
import { Role, AppModule, PermissionLevel, RolePermissions } from '../types';
import { UserIcon } from './icons';

const MODULE_NAMES: Record<AppModule, string> = {
    'recetas': 'Recetario',
    'calculadora': 'Calculadora de Recetas',
    'produccion': 'Plan de Producción (Mi Día)',
    'resumen-semanal': 'Resumen Semanal',
    'lotes': 'Lotes',
    'mermas': 'Registro y Reporte de Mermas',
    'checklist_produccion': 'Checklist (Producción)',
    'checklist_servicio': 'Checklist (Servicio)',
    'admin_usuarios': 'Gestión de Usuarios',
    'admin_ingredientes_y_categorias': 'Ingredientes y Categorías',
    'admin_tareas_operativas': 'Tareas Operativas (Admin)',
    'admin_reportes': 'Reportes',
    'admin_permisos': 'Gestión de Permisos',
};

const ROLES_ORDER: Role[] = [Role.Admin, Role.Produccion, Role.Servicio, Role.Cocina];

interface PermissionsManagementProps {
    rolePermissions: RolePermissions;
    onUpdatePermissions: (role: Role, module: AppModule, level: PermissionLevel) => void;
}

const PermissionsManagement: React.FC<PermissionsManagementProps> = ({ rolePermissions, onUpdatePermissions }) => {
    return (
        <div className="container mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <UserIcon />
                    <span className="ml-3">Gestión de Permisos por Rol</span>
                </h1>
                <p className="text-gray-600 mt-2">Configura qué puede ver y hacer cada rol en la aplicación.</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 sticky left-0 bg-gray-50 z-10">Módulo</th>
                                {ROLES_ORDER.map(role => (
                                    <th key={role} scope="col" className="px-6 py-3 text-center">{role}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {Object.keys(MODULE_NAMES).map(moduleKey => {
                                const module = moduleKey as AppModule;
                                if (module === 'admin_permisos') return null; // Don't allow editing permissions for the permissions page itself

                                return (
                                    <tr key={module} className="bg-white hover:bg-gray-50 group">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-white group-hover:bg-gray-50 z-10 whitespace-nowrap">
                                            {MODULE_NAMES[module]}
                                        </th>
                                        {ROLES_ORDER.map(role => (
                                            <td key={`${module}-${role}`} className="px-6 py-4 text-center">
                                                <select
                                                    value={rolePermissions[role]?.[module] || 'none'}
                                                    onChange={(e) => onUpdatePermissions(role, module, e.target.value as PermissionLevel)}
                                                    className="p-2 border border-gray-300 rounded-md bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                    aria-label={`Permiso para ${MODULE_NAMES[module]} en rol ${role}`}
                                                >
                                                    <option value="edit">Editar</option>
                                                    <option value="view">Solo Ver</option>
                                                    <option value="none">Sin Acceso</option>
                                                </select>
                                            </td>
                                        ))}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PermissionsManagement;