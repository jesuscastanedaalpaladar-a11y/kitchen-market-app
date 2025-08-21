
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User, Role, Recipe, Batch, ProductionTask, Waste, OperationalTask, OperationalTaskTemplate, TaskStatus, MasterIngredient, BusinessUnit, AppModule, PermissionLevel, RolePermissions } from './types';
import { MOCK_RECIPES, MOCK_BATCHES, MOCK_PRODUCTION_PLAN, MOCK_WASTE_RECORDS, MOCK_OPERATIONAL_TASKS, MOCK_OPERATIONAL_TASK_TEMPLATES, MOCK_MASTER_INGREDIENTS, MOCK_BUSINESS_UNITS, MOCK_USERS, MOCK_ROLE_PERMISSIONS } from './services/mockData';
import LoginScreen from './components/LoginScreen';
import UnitSelectorScreen from './components/UnitSelectorScreen';
import Dashboard from './components/Dashboard';
import RecipeList from './components/RecipeList';
import RecipeDetail from './components/RecipeDetail';
import UserManagement from './components/UserManagement';
import BatchList from './components/BatchList';
import BatchDetail from './components/BatchDetail';
import Reports from './components/Reports';
import RecipeCalculator from './components/RecipeCalculator';
import WeeklySummary from './components/WeeklySummary';
import WasteLog from './components/WasteLog';
import WasteReport from './components/WasteReport';
import OperationalTaskBoard from './components/OperationalTaskBoard';
import OperationalTaskAdmin from './components/OperationalTaskAdmin';
import IngredientManagement from './components/IngredientManagement';
import CategoryManagement from './components/CategoryManagement';
import PermissionsManagement from './components/PermissionsManagement';
import AccessDenied from './components/AccessDenied';
import MyDayView from './components/MyDayView';
import { ToastContainer } from './components/Toast';

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [recipes, setRecipes] = useState<Recipe[]>(MOCK_RECIPES);
    const [batches, setBatches] = useState<Batch[]>(MOCK_BATCHES);
    const [tasks, setTasks] = useState<ProductionTask[]>(MOCK_PRODUCTION_PLAN);
    const [wasteRecords, setWasteRecords] = useState<Waste[]>(MOCK_WASTE_RECORDS);
    const [operationalTasks, setOperationalTasks] = useState<OperationalTask[]>(MOCK_OPERATIONAL_TASKS);
    const [taskTemplates, setTaskTemplates] = useState<OperationalTaskTemplate[]>(MOCK_OPERATIONAL_TASK_TEMPLATES);
    const [masterIngredients, setMasterIngredients] = useState<MasterIngredient[]>(MOCK_MASTER_INGREDIENTS);
    const [businessUnits] = useState<BusinessUnit[]>(MOCK_BUSINESS_UNITS);
    const [rolePermissions, setRolePermissions] = useState<RolePermissions>(MOCK_ROLE_PERMISSIONS);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };
    
    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, type });
    };

    const isSuperAdmin = useMemo(() => currentUser?.accessibleUnitIds.includes('*'), [currentUser]);

    const hasPermission = useCallback((module: AppModule, requiredLevel: 'view' | 'edit'): boolean => {
        if (!currentUser) return false;
        if (isSuperAdmin) return true;

        // Determine the user's effective permission level for the module
        const overrideLevel = currentUser.permissionOverrides?.[module];
        const roleLevel = rolePermissions[currentUser.role]?.[module] || 'none';
        const effectiveLevel = overrideLevel || roleLevel;

        // Check if the effective level meets the required level
        if (requiredLevel === 'view') {
            return effectiveLevel === 'view' || effectiveLevel === 'edit';
        }
        if (requiredLevel === 'edit') {
            return effectiveLevel === 'edit';
        }
        
        return false;
    }, [currentUser, rolePermissions, isSuperAdmin]);

    const handleUpdatePermissions = useCallback((role: Role, module: AppModule, level: PermissionLevel) => {
        setRolePermissions(prev => ({
            ...prev,
            [role]: {
                ...prev[role],
                [module]: level,
            }
        }));
        showToast(`Permiso para ${role} en ${module} actualizado a ${level}.`);
    }, []);

    const handleLogin = (email: string):boolean => {
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
            setCurrentUser(user);
            const accessible = user.accessibleUnitIds;
            if (accessible.length === 1 && accessible[0] !== '*') {
                setActiveUnitId(accessible[0]);
            } else {
                // If user has multiple units or is super admin, force unit selection
                setActiveUnitId(null);
            }
            return true;
        }
        return false;
    };
    
    const handleSelectUnit = (unitId: string) => {
        setActiveUnitId(unitId);
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setActiveUnitId(null);
    };

    const handleAddRecipe = useCallback((newRecipe: Recipe) => {
        setRecipes(prevRecipes => [newRecipe, ...prevRecipes]);
        showToast(`Receta "${newRecipe.name}" creada exitosamente.`);
    }, []);

    const handleUpdateRecipe = useCallback((updatedRecipe: Recipe) => {
        setRecipes(prevRecipes =>
            prevRecipes.map(recipe =>
                recipe.id === updatedRecipe.id ? updatedRecipe : recipe
            )
        );
        showToast(`Receta "${updatedRecipe.name}" actualizada exitosamente.`);
    }, []);

    const handleAddTask = useCallback((recipeId: string, quantity: number) => {
        if (!activeUnitId || activeUnitId === 'all') {
            showToast('Por favor, selecciona una unidad específica para agregar una tarea.', 'error');
            return;
        }
        const recipe = recipes.find(r => r.id === recipeId);
        if (!recipe) return;

        const newTask: ProductionTask = {
            id: `task${Date.now()}`,
            recipeId: recipe.id,
            recipeName: recipe.name,
            quantityToProduce: quantity,
            unit: recipe.yieldUnit,
            priority: tasks.filter(t => t.status !== 'Completado' && t.unitId === activeUnitId).length + 1,
            status: 'Pendiente',
            unitId: activeUnitId,
        };
        setTasks(prevTasks => [...prevTasks, newTask].sort((a,b) => a.priority - b.priority));
        showToast(`Tarea "${recipe.name}" agregada al plan de producción.`);
    }, [recipes, tasks, activeUnitId]);

    const handleCompleteTaskAndAddBatch = useCallback((task: ProductionTask, recipe: Recipe, actualYield: number, duration: number, producerName: string) => {
        if (!currentUser) return;
        
        setTasks(prevTasks => prevTasks.map(t => t.id === task.id ? { ...t, status: 'Completado' } : t));

        const newBatch: Batch = {
            id: `B${Date.now()}`,
            recipeId: recipe.id,
            recipeName: recipe.name,
            productionDate: new Date().toISOString(),
            responsibleUser: producerName,
            shelfLifeDays: recipe.shelfLifeDays,
            quantity: actualYield,
            unit: recipe.yieldUnit,
            status: 'Activo',
            durationSeconds: duration,
            sourceTaskId: task.id,
            unitId: task.unitId,
        };
        setBatches(prevBatches => [newBatch, ...prevBatches]);
        showToast(`Lote para "${recipe.name}" generado exitosamente.`);
    }, [currentUser]);
    
    const handleAssignTask = useCallback((taskId: string, userId: number | null) => {
        setTasks(prevTasks =>
            prevTasks.map(task => {
                if (task.id === taskId) {
                    const user = users.find(u => u.id === userId);
                    return { ...task, assignedUserId: user?.id };
                }
                return task;
            })
        );
    }, [users]);

    const handleAddNoteToBatch = useCallback((batchId: string, note: string) => {
        setBatches(prevBatches =>
            prevBatches.map(batch => batch.id === batchId ? { ...batch, notes: note } : batch)
        );
        showToast('Nota guardada exitosamente.');
    }, []);

    const handleAddWaste = useCallback((wasteData: Omit<Waste, 'id' | 'date' | 'responsibleUser'>) => {
        if (!currentUser) return;
        const newWaste: Waste = {
            ...wasteData,
            id: `W${Date.now()}`,
            date: new Date().toISOString(),
            responsibleUser: currentUser.name,
        };
        setWasteRecords(prev => [newWaste, ...prev]);
        showToast(`Merma de "${wasteData.relatedRecipeOrBatchName || wasteData.description}" registrada.`);
    }, [currentUser]);

    const handleUpdateOperationalTaskStatus = useCallback((taskId: string, newStatus: TaskStatus) => {
        setOperationalTasks(prev =>
            prev.map(task => (task.id === taskId ? { ...task, status: newStatus } : task))
        );
    }, []);
    
    const handleReorderProductionTasks = useCallback((draggedId: string, targetId: string) => {
        if (draggedId === targetId) return;

        setTasks(currentTasks => {
            const pending = currentTasks.filter(t => t.status !== 'Completado').sort((a, b) => a.priority - b.priority);
            const completed = currentTasks.filter(t => t.status === 'Completado');

            const draggedIndex = pending.findIndex(t => t.id === draggedId);
            if (draggedIndex === -1) return currentTasks;

            const [draggedItem] = pending.splice(draggedIndex, 1);
            
            const targetIndex = pending.findIndex(t => t.id === targetId);
            if (targetIndex === -1) {
                pending.push(draggedItem);
            } else {
                pending.splice(targetIndex, 0, draggedItem);
            }

            const updatedPending = pending.map((task, index) => ({ ...task, priority: index + 1 }));

            return [...updatedPending, ...completed];
        });
    }, []);

    const handleReorderOperationalTasks = useCallback((draggedId: string, targetId: string) => {
        if (draggedId === targetId) return;

        setOperationalTasks(currentTasks => {
            const tasksCopy = [...currentTasks];
            const draggedIndex = tasksCopy.findIndex(t => t.id === draggedId);
            if (draggedIndex === -1) return currentTasks;

            const [draggedItem] = tasksCopy.splice(draggedIndex, 1);

            const targetIndex = tasksCopy.findIndex(t => t.id === targetId);
            if (targetIndex === -1) return currentTasks;
            
            tasksCopy.splice(targetIndex, 0, draggedItem);
            return tasksCopy;
        });
    }, []);

    const handleAddTaskTemplate = useCallback((templateData: Omit<OperationalTaskTemplate, 'id'>) => {
        const newTemplate: OperationalTaskTemplate = {
            ...templateData,
            id: `opt${Date.now()}`
        };
        setTaskTemplates(prev => [...prev, newTemplate]);
        showToast(`Nueva plantilla de tarea "${templateData.name}" creada.`);
    }, []);
    
    const handleAddMasterIngredient = useCallback((ingredientData: Omit<MasterIngredient, 'id'>) => {
        const newIngredient: MasterIngredient = {
            ...ingredientData,
            id: `ing-${Date.now()}`,
        };
        setMasterIngredients(prev => [...prev, newIngredient].sort((a,b) => a.name.localeCompare(b.name)));
    }, []);

    const handleUpdateMasterIngredient = useCallback((updatedIngredient: MasterIngredient) => {
        setMasterIngredients(prev =>
            prev.map(ing => (ing.id === updatedIngredient.id ? updatedIngredient : ing))
        );
    }, []);

    const handleUpdateCategory = useCallback((oldName: string, newName: string) => {
        if (!newName.trim() || oldName === newName) return;
        setMasterIngredients(prev =>
            prev.map(ing => (ing.category === oldName ? { ...ing, category: newName } : ing))
        );
        showToast(`Categoría "${oldName}" renombrada a "${newName}".`);
    }, []);

    const handleDeleteCategory = useCallback((categoryToDelete: string, targetCategory: string) => {
        if (!targetCategory || categoryToDelete === targetCategory) {
            showToast("Debe seleccionar una categoría de destino válida.", "error");
            return;
        }
        setMasterIngredients(prev =>
            prev.map(ing => (ing.category === categoryToDelete ? { ...ing, category: targetCategory } : ing))
        );
        showToast(`Categoría "${categoryToDelete}" eliminada. Ingredientes movidos a "${targetCategory}".`);
    }, []);
    
    const handleUpdateUser = useCallback((updatedUser: User) => {
        setUsers(prevUsers =>
            prevUsers.map(user =>
                user.id === updatedUser.id ? updatedUser : user
            )
        );
        
        if (currentUser && currentUser.id === updatedUser.id) {
            setCurrentUser(updatedUser);
            const accessible = updatedUser.accessibleUnitIds;
            const isAllAccess = accessible.length === 1 && accessible[0] === '*';
            
            if (!isAllAccess && activeUnitId && activeUnitId !== 'all' && !accessible.includes(activeUnitId)) {
                if (accessible.length === 1) {
                    setActiveUnitId(accessible[0]);
                } else {
                    setActiveUnitId(null);
                }
            }
        }
        showToast(`Usuario "${updatedUser.name}" actualizado.`);
    }, [currentUser, activeUnitId]);

    const handleAddUser = useCallback((userData: Omit<User, 'id'>) => {
        const newUser: User = {
            ...userData,
            id: Date.now(),
        };
        setUsers(prevUsers => [...prevUsers, newUser]);
        showToast(`Usuario "${newUser.name}" creado exitosamente.`);
    }, []);

    const handleDeleteUser = useCallback((userIdToDelete: number) => {
        if (currentUser && currentUser.id === userIdToDelete) {
            showToast("No puedes eliminar al usuario con el que has iniciado sesión.", "error");
            return;
        }
        
        const userToDelete = users.find(u => u.id === userIdToDelete);
        if (window.confirm(`¿Estás seguro de que quieres eliminar al usuario "${userToDelete?.name}"?`)) {
            setUsers(prevUsers => prevUsers.filter(user => user.id !== userIdToDelete));
            showToast(`Usuario "${userToDelete?.name}" eliminado.`);
        }
    }, [currentUser, users]);

    const filteredData = useMemo(() => {
        if (!currentUser) return { tasks: [], batches: [], wasteRecords: [], operationalTasks: [] };

        if (activeUnitId && activeUnitId !== 'all') {
            return {
                tasks: tasks.filter(item => item.unitId === activeUnitId),
                batches: batches.filter(item => item.unitId === activeUnitId),
                wasteRecords: wasteRecords.filter(item => item.unitId === activeUnitId),
                operationalTasks: operationalTasks.filter(item => item.unitId === activeUnitId),
            };
        }

        if (currentUser.accessibleUnitIds.includes('*')) {
            return { tasks, batches, wasteRecords, operationalTasks };
        } else {
            const accessible = currentUser.accessibleUnitIds;
            return {
                tasks: tasks.filter(item => accessible.includes(item.unitId)),
                batches: batches.filter(item => accessible.includes(item.unitId)),
                wasteRecords: wasteRecords.filter(item => accessible.includes(item.unitId)),
                operationalTasks: operationalTasks.filter(item => accessible.includes(item.unitId)),
            };
        }
    }, [tasks, batches, wasteRecords, operationalTasks, activeUnitId, currentUser]);

    if (!currentUser) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    if (!activeUnitId) {
        return <UnitSelectorScreen user={currentUser} units={businessUnits} onSelectUnit={handleSelectUnit} onLogout={handleLogout} />;
    }

    return (
        <HashRouter>
            <ToastContainer toast={toast} setToast={setToast} />
            <Dashboard 
                user={currentUser} 
                onLogout={handleLogout}
                activeUnitId={activeUnitId}
                setActiveUnitId={setActiveUnitId}
                businessUnits={businessUnits}
                hasPermission={hasPermission}
                isSuperAdmin={isSuperAdmin}
                theme={theme}
                toggleTheme={toggleTheme}
            >
                <Routes>
                    <Route path="/" element={<Navigate to="/produccion" replace />} />
                    
                    <Route path="/recetas" element={hasPermission('recetas', 'view') ? <RecipeList recipes={recipes} masterIngredients={masterIngredients} onAddRecipe={handleAddRecipe} hasPermission={hasPermission} /> : <AccessDenied />} />
                    <Route path="/recetas/:recipeId" element={hasPermission('recetas', 'view') ? <RecipeDetail recipes={recipes} masterIngredients={masterIngredients} currentUser={currentUser} onUpdateRecipe={handleUpdateRecipe} hasPermission={hasPermission} /> : <AccessDenied />} />
                    <Route path="/calculadora" element={hasPermission('calculadora', 'view') ? <RecipeCalculator recipes={recipes} onAddTask={handleAddTask} /> : <AccessDenied />} />
                    
                    <Route path="/produccion" element={hasPermission('produccion', 'view') ? <MyDayView currentUser={currentUser} tasks={filteredData.tasks} recipes={recipes} users={users} operationalTasks={filteredData.operationalTasks} onAddTask={handleAddTask} onCompleteTaskAndAddBatch={handleCompleteTaskAndAddBatch} onAssignTask={handleAssignTask} onReorderProductionTasks={handleReorderProductionTasks} onUpdateOperationalTaskStatus={handleUpdateOperationalTaskStatus} onReorderOperationalTasks={handleReorderOperationalTasks}/> : <AccessDenied />} />
                    <Route path="/resumen-semanal" element={hasPermission('resumen-semanal', 'view') ? <WeeklySummary batches={filteredData.batches} recipes={recipes} /> : <AccessDenied />} />
                    
                    <Route path="/checklist-produccion" element={hasPermission('checklist_produccion', 'view') ? <OperationalTaskBoard tasks={filteredData.operationalTasks.filter(t => t.assignedRole === Role.Produccion)} onUpdateTaskStatus={handleUpdateOperationalTaskStatus} onReorderTasks={handleReorderOperationalTasks} title="Checklist de Actividades (Producción)"/> : <AccessDenied />} />
                    <Route path="/checklist-servicio" element={hasPermission('checklist_servicio', 'view') ? <OperationalTaskBoard tasks={filteredData.operationalTasks.filter(t => t.assignedRole === Role.Servicio)} onUpdateTaskStatus={handleUpdateOperationalTaskStatus} onReorderTasks={handleReorderOperationalTasks} title="Checklist de Actividades (Servicio)"/> : <AccessDenied />} />

                    <Route path="/lotes" element={hasPermission('lotes', 'view') ? <BatchList batches={filteredData.batches} /> : <AccessDenied />} />
                    <Route path="/lotes/:batchId" element={hasPermission('lotes', 'view') ? <BatchDetail batches={batches} tasks={tasks} recipes={recipes} onAddNote={handleAddNoteToBatch} /> : <AccessDenied />} />
                    
                    <Route path="/mermas" element={hasPermission('mermas', 'view') ? <WasteLog recipes={recipes} batches={batches} onAddWaste={handleAddWaste} units={businessUnits} /> : <AccessDenied />} />
                    <Route path="/reporte-mermas" element={hasPermission('mermas', 'view') ? <WasteReport wasteRecords={filteredData.wasteRecords} units={businessUnits} /> : <AccessDenied />} />

                    <Route path="/admin/ingredientes" element={hasPermission('admin_ingredientes_y_categorias', 'view') ? <IngredientManagement ingredients={masterIngredients} onAddIngredient={handleAddMasterIngredient} onUpdateIngredient={handleUpdateMasterIngredient} /> : <AccessDenied />} />
                    <Route path="/admin/categorias" element={hasPermission('admin_ingredientes_y_categorias', 'view') ? <CategoryManagement masterIngredients={masterIngredients} onUpdateCategory={handleUpdateCategory} onDeleteCategory={handleDeleteCategory} /> : <AccessDenied />} />
                    <Route path="/admin/usuarios" element={hasPermission('admin_usuarios', 'view') ? <UserManagement users={users} units={businessUnits} onUpdateUser={handleUpdateUser} onAddUser={handleAddUser} onDeleteUser={handleDeleteUser} /> : <AccessDenied />} />
                    <Route path="/admin/reportes" element={hasPermission('admin_reportes', 'view') ? <Reports batches={filteredData.batches} /> : <AccessDenied />} />
                    <Route path="/admin/tareas-operativas" element={hasPermission('admin_tareas_operativas', 'view') ? <OperationalTaskAdmin templates={taskTemplates} onAddTaskTemplate={handleAddTaskTemplate} /> : <AccessDenied />} />
                    
                    <Route path="/admin/permisos" element={isSuperAdmin ? <PermissionsManagement rolePermissions={rolePermissions} onUpdatePermissions={handleUpdatePermissions} /> : <AccessDenied />} />
                    
                    <Route path="*" element={<AccessDenied />} />
                </Routes>
            </Dashboard>
        </HashRouter>
    );
};

export default App;
