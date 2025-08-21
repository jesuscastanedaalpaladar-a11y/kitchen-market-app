
import React, { useState, useEffect } from 'react';
import { User, Role, BusinessUnit, AppModule, PermissionLevel } from '../types';
import { UserIcon, PlusIcon } from './icons';

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

interface UserFormModalProps {
    isOpen: boolean;
    mode: 'add' | 'edit';
    userToEdit?: User;
    units: BusinessUnit[];
    onSave: (user: User | Omit<User, 'id'>) => void;
    onClose: () => void;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, mode, userToEdit, units, onSave, onClose }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<Role>(Role.Cocina);
    const [accessibleUnitIds, setAccessibleUnitIds] = useState<string[]>([]);
    const [permissionOverrides, setPermissionOverrides] = useState<User['permissionOverrides']>({});

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && userToEdit) {
                setName(userToEdit.name);
                setEmail(userToEdit.email);
                setRole(userToEdit.role);
                setAccessibleUnitIds(userToEdit.accessibleUnitIds);
                setPermissionOverrides(userToEdit.permissionOverrides || {});
            } else { // Add mode
                setName('');
                setEmail('');
                setRole(Role.Cocina);
                setAccessibleUnitIds([]);
                setPermissionOverrides({});
            }
        }
    }, [isOpen, mode, userToEdit]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!name.trim() || !email.trim()) {
            alert("El nombre y el correo no pueden estar vacíos.");
            return;
        }
        if (role !== Role.Admin && accessibleUnitIds.length === 0) {
            alert("Debe asignar al menos una unidad al usuario.");
            return;
        }

        const cleanOverrides: User['permissionOverrides'] = {};
        Object.entries(permissionOverrides).forEach(([key, value]) => {
            if (value) {
                cleanOverrides[key as AppModule] = value;
            }
        });

        const userData: Partial<User> & Omit<User, 'id'> = { 
            name, 
            email,
            role, 
            accessibleUnitIds, 
            permissionOverrides: Object.keys(cleanOverrides).length > 0 ? cleanOverrides : undefined 
        };

        if (mode === 'edit' && userToEdit) {
            onSave({ ...userToEdit, ...userData });
        } else {
            onSave(userData as Omit<User, 'id'>);
        }
    };

    const handleRoleChange = (newRole: Role) => {
        setRole(newRole);
        if (newRole === Role.Admin) {
            setAccessibleUnitIds(['*']);
        } else {
            const currentIds = accessibleUnitIds[0] === '*' ? [] : accessibleUnitIds;
            const canBeMultiUnit = newRole === Role.Cocina || newRole === Role.Produccion;
            if (!canBeMultiUnit && currentIds.length > 1) {
                setAccessibleUnitIds(currentIds.slice(0, 1));
            } else if (currentIds.length === 0 && units.length > 0) {
                 setAccessibleUnitIds([units[0].id]);
            } else {
                 setAccessibleUnitIds(currentIds);
            }
        }
    };
    
    const handleUnitToggle = (unitId: string) => {
        const canBeMultiUnit = role === Role.Cocina || role === Role.Produccion;
        if (canBeMultiUnit) {
            setAccessibleUnitIds(currentIds => 
                currentIds.includes(unitId)
                    ? currentIds.filter(id => id !== unitId)
                    : [...currentIds, unitId]
            );
        } else {
            setAccessibleUnitIds([unitId]);
        }
    };

    const handleOverrideChange = (module: AppModule, value: string) => {
        setPermissionOverrides(prev => {
            const newOverrides = { ...prev };
            if (value === 'default') {
                delete newOverrides[module];
            } else {
                newOverrides[module] = value as PermissionLevel;
            }
            return newOverrides;
        });
    };
    
    const canBeMultiUnit = role === Role.Cocina || role === Role.Produccion;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-start p-4 overflow-y-auto" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b dark:border-gray-700"><h2 className="text-2xl font-bold text-gray-800 dark:text-white">{mode === 'edit' ? 'Editar Usuario' : 'Añadir Nuevo Usuario'}</h2></div>
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="user-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Completo</label>
                            <input type="text" id="user-name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700"/>
                        </div>
                        <div>
                            <label htmlFor="user-role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rol</label>
                            <select id="user-role" value={role} onChange={e => handleRoleChange(e.target.value as Role)} className="mt-1 block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
                                {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="user-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Correo Electrónico</label>
                            <input type="email" id="user-email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Unidades Asignadas</label>
                        {role === Role.Admin ? (
                             <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 italic">Los administradores siempre tienen acceso a todas las unidades.</p>
                        ) : (
                            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border p-3 rounded-md bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600">
                                {units.map(unit => (
                                    <div key={unit.id} className="flex items-center">
                                        <input
                                            type={canBeMultiUnit ? "checkbox" : "radio"}
                                            id={`unit-modal-${unit.id}`}
                                            name="unit-selection"
                                            value={unit.id}
                                            checked={accessibleUnitIds.includes(unit.id)}
                                            onChange={() => handleUnitToggle(unit.id)}
                                            className={`${canBeMultiUnit ? 'form-checkbox' : 'form-radio'} h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-600 focus:ring-blue-500`}
                                        />
                                        <label htmlFor={`unit-modal-${unit.id}`} className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">{unit.name}</label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                     <div>
                        <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 border-t dark:border-gray-700 pt-4 mt-4">Permisos Individuales (Anulaciones)</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Anula los permisos del rol para este usuario específico.</p>
                        <div className="space-y-2 max-h-48 overflow-y-auto border p-3 rounded-md bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600">
                            {Object.entries(MODULE_NAMES)
                                .filter(([moduleKey]) => moduleKey !== 'admin_permisos') // Exclude permissions for the permissions page
                                .map(([moduleKey, moduleName]) => {
                                const module = moduleKey as AppModule;
                                return (
                                    <div key={module} className="flex justify-between items-center text-sm p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                                        <label htmlFor={`override-${module}`} className="text-gray-700 dark:text-gray-300">{moduleName}</label>
                                        <select
                                            id={`override-${module}`}
                                            value={permissionOverrides?.[module] || 'default'}
                                            onChange={(e) => handleOverrideChange(module, e.target.value)}
                                            className="p-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-xs"
                                        >
                                            <option value="default">Por Rol (Defecto)</option>
                                            <option value="edit">Editar</option>
                                            <option value="view">Solo Ver</option>
                                            <option value="none">Sin Acceso</option>
                                        </select>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 flex justify-end space-x-4">
                    <button onClick={onClose} className="px-6 py-3 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition">Cancelar</button>
                    <button onClick={handleSave} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">
                        {mode === 'edit' ? 'Guardar Cambios' : 'Crear Usuario'}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface UserManagementProps {
    users: User[];
    units: BusinessUnit[];
    onUpdateUser: (user: User) => void;
    onAddUser: (userData: Omit<User, 'id'>) => void;
    onDeleteUser: (userId: number) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, units, onUpdateUser, onAddUser, onDeleteUser }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);

    const handleOpenModal = (mode: 'add' | 'edit', user?: User) => {
        setModalMode(mode);
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUser(undefined);
    };
    
    const handleSaveUser = (userData: User | Omit<User, 'id'>) => {
        if (modalMode === 'edit') {
            onUpdateUser(userData as User);
        } else {
            onAddUser(userData as Omit<User, 'id'>);
        }
        handleCloseModal();
    };

    return (
        <div className="container mx-auto">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                            <UserIcon />
                            <span className="ml-3">Gestión de Usuarios</span>
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Administra los usuarios y sus roles en el sistema.</p>
                    </div>
                     <button onClick={() => handleOpenModal('add')} className="bg-blue-600 text-white font-bold py-3 px-5 rounded-lg hover:bg-blue-700 flex items-center shadow-lg">
                        <PlusIcon/> <span className="ml-2">Añadir Nuevo Usuario</span>
                    </button>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-base text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-sm text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-4">Nombre</th>
                                <th scope="col" className="px-6 py-4">Email</th>
                                <th scope="col" className="px-6 py-4">Rol</th>
                                <th scope="col" className="px-6 py-4">Unidades Asignadas</th>
                                <th scope="col" className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white">{user.name}</th>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-semibold bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 px-2 py-1 rounded-full">{user.role}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.accessibleUnitIds[0] === '*' ? (
                                            <span className="text-sm font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 px-2 py-1 rounded-full">Todas las Unidades</span>
                                        ) : (
                                            <div className="flex flex-wrap gap-1">
                                                {user.accessibleUnitIds.map(unitId => (
                                                    <span key={unitId} className="text-sm font-semibold bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200 px-2 py-1 rounded-full">{units.find(u => u.id === unitId)?.name || unitId}</span>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 space-x-4 text-right">
                                        <button onClick={() => handleOpenModal('edit', user)} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">Editar</button>
                                        <button onClick={() => onDeleteUser(user.id)} className="font-medium text-red-600 dark:text-red-400 hover:underline">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
             {isModalOpen && (
                 <UserFormModal 
                    isOpen={isModalOpen} 
                    mode={modalMode} 
                    userToEdit={selectedUser} 
                    units={units} 
                    onSave={handleSaveUser} 
                    onClose={handleCloseModal} 
                 />
            )}
        </div>
    );
};

export default UserManagement;
