
import { User, Role, Recipe, ProductionTask, Batch, Waste, WasteType, OperationalTaskTemplate, TaskFrequency, OperationalTask, TaskStatus, RecipeType, Unit, MasterIngredient, BusinessUnit, RolePermissions } from '../types';

export const MOCK_BUSINESS_UNITS: BusinessUnit[] = [
    { id: 'prod-central', name: 'Producción Central', type: 'production' },
    { id: 'polanco', name: 'Sucursal Polanco', type: 'branch' },
    { id: 'tecamachalco', name: 'Sucursal Tecamachalco', type: 'branch' },
    { id: 'santa-fe', name: 'Sucursal Santa Fe', type: 'branch' },
];

export const MOCK_USERS: User[] = [
    { id: 1, name: 'Super Admin', email: 'super@kitchen.com', role: Role.Admin, accessibleUnitIds: ['*'] }, // Has access to all
    { id: 2, name: 'Ulises (Jefe Prod)', email: 'ulises@kitchen.com', role: Role.Produccion, accessibleUnitIds: ['prod-central'] },
    { id: 3, name: 'Servicio Polanco', email: 'servicio.polanco@kitchen.com', role: Role.Servicio, accessibleUnitIds: ['polanco'] },
    { id: 4, name: 'Cocina Polanco', email: 'cocina.polanco@kitchen.com', role: Role.Cocina, accessibleUnitIds: ['polanco'] },
    { id: 5, name: 'Ana (Producción)', email: 'ana@kitchen.com', role: Role.Produccion, accessibleUnitIds: ['prod-central'] },
    { id: 6, name: 'Carlos (Producción)', email: 'carlos@kitchen.com', role: Role.Produccion, accessibleUnitIds: ['prod-central'] },
    { id: 7, name: 'Chef Regional', email: 'chef.regional@kitchen.com', role: Role.Cocina, accessibleUnitIds: ['polanco', 'tecamachalco'] },
    { id: 8, name: 'Servicio Tecamachalco', email: 'servicio.teca@kitchen.com', role: Role.Servicio, accessibleUnitIds: ['tecamachalco'] },
    { id: 9, name: 'Admin de Sucursales', email: 'admin.sucursales@kitchen.com', role: Role.Admin, accessibleUnitIds: ['polanco', 'tecamachalco', 'santa-fe'] },
    { 
        id: 10, 
        name: 'Admin de Marketing', 
        email: 'marketing@kitchen.com',
        role: Role.Admin, 
        accessibleUnitIds: ['polanco', 'tecamachalco', 'santa-fe'],
        permissionOverrides: {
            'produccion': 'none',
            'lotes': 'none',
        }
    },
];

export const MOCK_MASTER_INGREDIENTS: MasterIngredient[] = [
    { id: 'ing-1', name: 'Tomate', category: 'Vegetales', unit: 'kg' },
    { id: 'ing-2', name: 'Cebolla', category: 'Vegetales', unit: 'kg' },
    { id: 'ing-3', name: 'Ajo', category: 'Vegetales', unit: 'pzas' },
    { id: 'ing-4', name: 'Chile Serrano', category: 'Chiles', unit: 'pzas' },
    { id: 'ing-5', name: 'Sal', category: 'Condimentos', unit: 'kg' },
    { id: 'ing-6', name: 'Pasta Fettuccine', category: 'Pastas', unit: 'kg' },
    { id: 'ing-7', name: 'Crema para batir', category: 'Lácteos', unit: 'L' },
    { id: 'ing-8', name: 'Queso Parmesano', category: 'Lácteos', unit: 'kg' },
    { id: 'ing-9', name: 'Mantequilla', category: 'Lácteos', unit: 'kg' },
    { id: 'ing-10', name: 'Pechuga de Pollo', category: 'Proteínas', unit: 'kg' },
    { id: 'ing-11', name: 'Jugo de Limón', category: 'Frutas', unit: 'L' },
    { id: 'ing-12', name: 'Aceite de Oliva', category: 'Aceites', unit: 'L' },
    { id: 'ing-13', name: 'Orégano seco', category: 'Hierbas', unit: 'kg' },
    { id: 'ing-14', name: 'Pimienta', category: 'Condimentos', unit: 'kg' },
];


export const MOCK_RECIPES: Recipe[] = [
    {
        id: 'salsa-roja',
        name: 'Salsa Roja Clásica',
        category: 'Salsas',
        type: RecipeType.Produccion,
        ingredients: [
            { ingredientId: 'ing-1', ingredientName: 'Tomate', quantity: 1, unit: Unit.kg },
            { ingredientId: 'ing-2', ingredientName: 'Cebolla', quantity: 0.2, unit: Unit.kg },
            { ingredientId: 'ing-3', ingredientName: 'Ajo', quantity: 2, unit: Unit.pzas },
            { ingredientId: 'ing-4', ingredientName: 'Chile Serrano', quantity: 3, unit: Unit.pzas },
            { ingredientId: 'ing-5', ingredientName: 'Sal', quantity: 0.01, unit: Unit.kg },
        ],
        steps: [
            { description: 'Asar los tomates, cebolla, ajo y chiles.' },
            { description: 'Licuar todos los ingredientes asados con sal.' },
            { description: 'Sazonar en una cacerola caliente por 10 minutos.' },
        ],
        prepTimeMinutes: 30,
        expectedYield: 1,
        yieldUnit: 'L',
        photoUrl: 'https://picsum.photos/seed/salsa/400/300',
        shelfLifeDays: 5,
    },
    {
        id: 'pasta-alfredo',
        name: 'Pasta Alfredo',
        category: 'Pastas',
        type: RecipeType.Servicio,
        ingredients: [
            { ingredientId: 'ing-6', ingredientName: 'Pasta Fettuccine', quantity: 0.5, unit: Unit.kg },
            { ingredientId: 'ing-7', ingredientName: 'Crema para batir', quantity: 0.5, unit: Unit.L },
            { ingredientId: 'ing-8', ingredientName: 'Queso Parmesano', quantity: 0.15, unit: Unit.kg },
            { ingredientId: 'ing-9', ingredientName: 'Mantequilla', quantity: 0.05, unit: Unit.kg },
            { ingredientId: 'ing-3', ingredientName: 'Ajo', quantity: 2, unit: Unit.pzas },
        ],
        steps: [
            { description: 'Cocer la pasta según las instrucciones del paquete.' },
            { description: 'En un sartén, derretir la mantequilla y sofreír el ajo picado.' },
            { description: 'Agregar la crema y el queso parmesano. Cocinar a fuego bajo hasta espesar.' },
            { description: 'Mezclar la pasta con la salsa.' },
        ],
        prepTimeMinutes: 25,
        expectedYield: 4,
        yieldUnit: 'ord',
        photoUrl: 'https://picsum.photos/seed/pasta/400/300',
        shelfLifeDays: 3,
    },
    {
        id: 'pollo-parrilla',
        name: 'Pollo a la Parrilla Marinado',
        category: 'Proteínas',
        type: RecipeType.Produccion,
        ingredients: [
            { ingredientId: 'ing-10', ingredientName: 'Pechuga de Pollo', quantity: 1, unit: Unit.kg },
            { ingredientId: 'ing-11', ingredientName: 'Jugo de Limón', quantity: 0.1, unit: Unit.L },
            { ingredientId: 'ing-12', ingredientName: 'Aceite de Oliva', quantity: 0.05, unit: Unit.L },
            { ingredientId: 'ing-13', ingredientName: 'Orégano seco', quantity: 0.01, unit: Unit.kg },
            { ingredientId: 'ing-14', ingredientName: 'Pimienta', quantity: 0.005, unit: Unit.kg },
        ],
        steps: [
            { description: 'Mezclar jugo de limón, aceite, orégano y pimienta para el marinado.' },
            { description: 'Marinar el pollo por al menos 30 minutos.' },
            { description: 'Cocinar el pollo en la parrilla caliente hasta que esté bien cocido.' },
        ],
        prepTimeMinutes: 50,
        expectedYield: 0.8,
        yieldUnit: 'kg',
        photoUrl: 'https://picsum.photos/seed/pollo/400/300',
        shelfLifeDays: 4,
    },
];

export const MOCK_PRODUCTION_PLAN: ProductionTask[] = [
    { id: 'task1', recipeId: 'salsa-roja', recipeName: 'Salsa Roja Clásica', quantityToProduce: 20, unit: 'L', priority: 1, status: 'Pendiente', assignedUserId: 2, unitId: 'prod-central' },
    { id: 'task2', recipeId: 'pollo-parrilla', recipeName: 'Pollo a la Parrilla Marinado', quantityToProduce: 15, unit: 'kg', priority: 2, status: 'Pendiente', assignedUserId: 5, unitId: 'prod-central' },
    { id: 'task3', recipeId: 'pasta-alfredo', recipeName: 'Pasta Alfredo', quantityToProduce: 10, unit: 'ord', priority: 3, status: 'Completado', assignedUserId: 4, unitId: 'polanco' },
    { id: 'task4', recipeId: 'salsa-roja', recipeName: 'Salsa Roja Clásica', quantityToProduce: 5, unit: 'L', priority: 4, status: 'Pendiente', unitId: 'prod-central' },
];

export const MOCK_BATCHES: Batch[] = [
    { id: 'B1721249501', recipeId: 'salsa-roja', recipeName: 'Salsa Roja Clásica', productionDate: new Date(Date.now() - 86400000).toISOString(), responsibleUser: 'Ulises (Jefe Prod)', shelfLifeDays: 5, quantity: 10, unit: 'L', status: 'Activo', durationSeconds: 1680, sourceTaskId: 'task1', unitId: 'prod-central' },
    { id: 'B1721163101', recipeId: 'pollo-parrilla', recipeName: 'Pollo a la Parrilla Marinado', productionDate: new Date(Date.now() - 172800000).toISOString(), responsibleUser: 'Ana (Producción)', shelfLifeDays: 4, quantity: 8, unit: 'kg', status: 'Activo', durationSeconds: 3300, sourceTaskId: 'task2', notes: 'El pollo salió un poco seco, revisar tiempo en parrilla la próxima vez.', unitId: 'prod-central' },
    { id: 'B1721076701', recipeId: 'pasta-alfredo', recipeName: 'Pasta Alfredo', productionDate: new Date(Date.now() - 259200000).toISOString(), responsibleUser: 'Cocina Polanco', shelfLifeDays: 3, quantity: 10, unit: 'ord', status: 'Activo', durationSeconds: 1500, sourceTaskId: 'task3', unitId: 'polanco' },
];

export const MOCK_OPERATIONAL_TASK_TEMPLATES: OperationalTaskTemplate[] = [
    { id: 'opt1', name: 'Limpiar y desinfectar mesas de trabajo', description: 'Usar solución desinfectante en todas las superficies de acero inoxidable.', frequency: TaskFrequency.Diaria, assignedRole: Role.Produccion },
    { id: 'opt2', name: 'Verificar temperaturas de refrigeradores', description: 'Anotar temperaturas de refrigerador 1, 2 y congelador en la bitácora.', frequency: TaskFrequency.Diaria, assignedRole: Role.Produccion },
    { id: 'opt3', name: 'Limpieza profunda de horno', description: 'Ciclo de limpieza completo y revisión de quemadores.', frequency: TaskFrequency.Semanal, assignedRole: Role.Produccion },
    { id: 'opt4', name: 'Revisar y rotar etiquetados (FIFO)', description: 'Asegurarse que todos los productos estén etiquetados y los más antiguos estén al frente.', frequency: TaskFrequency.Diaria, assignedRole: Role.Produccion },
    { id: 'opt5', name: 'Montar línea de servicio fría', description: 'Rellenar todos los contenedores de la barra fría.', frequency: TaskFrequency.Diaria, assignedRole: Role.Servicio },
    { id: 'opt6', name: 'Rellenar salseros y toppings', description: 'Verificar niveles y rellenar todos los dispensadores.', frequency: TaskFrequency.Diaria, assignedRole: Role.Servicio },
    { id: 'opt7', name: 'Limpieza de campana extractora', description: 'Limpiar filtros y superficie de la campana.', frequency: TaskFrequency.Semanal, assignedRole: Role.Servicio },
    { id: 'opt8', name: 'Revisar mise en place de línea', description: 'Verificar que toda la línea esté completa, con producto fresco y rotado.', frequency: TaskFrequency.Diaria, assignedRole: Role.Cocina },
    { id: 'opt9', name: 'Validar registro de mermas', description: 'Revisar bitácora de mermas y validar que los registros del turno sean correctos.', frequency: TaskFrequency.Diaria, assignedRole: Role.Cocina },
];

export const MOCK_OPERATIONAL_TASKS: OperationalTask[] = [
    { id: 'ot1', templateId: 'opt1', name: 'Limpiar y desinfectar mesas de trabajo', description: 'Usar solución desinfectante en todas las superficies de acero inoxidable.', date: new Date().toISOString(), status: TaskStatus.Pendiente, assignedRole: Role.Produccion, unitId: 'prod-central' },
    { id: 'ot2', templateId: 'opt2', name: 'Verificar temperaturas de refrigeradores', description: 'Anotar temperaturas de refrigerador 1, 2 y congelador en la bitácora.', date: new Date().toISOString(), status: TaskStatus.Pendiente, assignedRole: Role.Produccion, unitId: 'prod-central' },
    { id: 'ot3', templateId: 'opt4', name: 'Revisar y rotar etiquetados (FIFO)', description: 'Asegurarse que todos los productos estén etiquetados y los más antiguos estén al frente.', date: new Date().toISOString(), status: TaskStatus.EnProgreso, assignedRole: Role.Produccion, unitId: 'prod-central' },
    { id: 'ot4', templateId: 'opt5', name: 'Montar línea de servicio fría', description: 'Rellenar todos los contenedores de la barra fría.', date: new Date().toISOString(), status: TaskStatus.Pendiente, assignedRole: Role.Servicio, unitId: 'polanco' },
    { id: 'ot5', templateId: 'opt6', name: 'Rellenar salseros y toppings', description: 'Verificar niveles y rellenar todos los dispensadores.', date: new Date().toISOString(), status: TaskStatus.Completado, assignedRole: Role.Servicio, unitId: 'polanco' },
    { id: 'ot6', templateId: 'opt3', name: 'Limpieza profunda de horno', description: 'Ciclo de limpieza completo y revisión de quemadores.', date: new Date().toISOString(), status: TaskStatus.Pendiente, assignedRole: Role.Produccion, unitId: 'prod-central' },
    { id: 'ot7', templateId: 'opt5', name: 'Montar línea de servicio fría', description: 'Rellenar todos los contenedores de la barra fría.', date: new Date().toISOString(), status: TaskStatus.Pendiente, assignedRole: Role.Servicio, unitId: 'tecamachalco' },
    { id: 'ot8', templateId: 'opt8', name: 'Revisar mise en place de línea', description: 'Verificar que toda la línea esté completa, con producto fresco y rotado.', date: new Date().toISOString(), status: TaskStatus.Pendiente, assignedRole: Role.Cocina, unitId: 'polanco' },
    { id: 'ot9', templateId: 'opt9', name: 'Validar registro de mermas', description: 'Revisar bitácora de mermas y validar que los registros del turno sean correctos.', date: new Date().toISOString(), status: TaskStatus.Pendiente, assignedRole: Role.Cocina, unitId: 'polanco' },
    { id: 'ot10', templateId: 'opt8', name: 'Revisar mise en place de línea', description: 'Verificar que toda la línea esté completa, con producto fresco y rotado.', date: new Date().toISOString(), status: TaskStatus.Pendiente, assignedRole: Role.Cocina, unitId: 'tecamachalco' },
];


export const MOCK_UNITS: string[] = ['g', 'kg', 'L', 'pzas', 'ord'];
export const UNITS: Unit[] = [Unit.g, Unit.kg, Unit.L, Unit.pzas, Unit.ord];

export const MOCK_WASTE_RECORDS: Waste[] = [
    {
        id: 'W1721310001',
        date: new Date(Date.now() - 86400000 * 1).toISOString(),
        unitId: 'prod-central',
        type: WasteType.Sobreproduccion,
        relatedRecipeOrBatchId: 'salsa-roja',
        relatedRecipeOrBatchName: 'Salsa Roja Clásica',
        quantity: 1.5,
        unit: 'L',
        responsibleUser: 'Ulises (Jefe Prod)'
    },
    {
        id: 'W1721310002',
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        unitId: 'polanco',
        type: WasteType.Caducidad,
        relatedRecipeOrBatchId: 'B1721163101',
        relatedRecipeOrBatchName: 'Pollo a la Parrilla Marinado (Lote B1721163101)',
        quantity: 0.5,
        unit: 'kg',
        responsibleUser: 'Ana (Producción)'
    },
    {
        id: 'W1721310003',
        date: new Date().toISOString(),
        unitId: 'tecamachalco',
        type: WasteType.Preparacion,
        description: 'Tomates magullados en recepción',
        quantity: 2,
        unit: 'kg',
        responsibleUser: 'Carlos (Producción)'
    },
];

export const MOCK_ROLE_PERMISSIONS: RolePermissions = {
    [Role.Admin]: {
        recetas: 'edit',
        calculadora: 'edit',
        produccion: 'edit',
        'resumen-semanal': 'view',
        lotes: 'edit',
        mermas: 'edit',
        checklist_produccion: 'edit',
        checklist_servicio: 'edit',
        admin_usuarios: 'edit',
        admin_ingredientes_y_categorias: 'edit',
        admin_tareas_operativas: 'edit',
        admin_reportes: 'view',
        admin_permisos: 'edit',
    },
    [Role.Produccion]: {
        recetas: 'view',
        calculadora: 'edit',
        produccion: 'edit',
        'resumen-semanal': 'view',
        lotes: 'view',
        mermas: 'edit',
        checklist_produccion: 'edit',
        checklist_servicio: 'none',
        admin_usuarios: 'none',
        admin_ingredientes_y_categorias: 'none',
        admin_tareas_operativas: 'none',
        admin_reportes: 'none',
        admin_permisos: 'none',
    },
    [Role.Servicio]: {
        recetas: 'view',
        calculadora: 'none',
        produccion: 'none',
        'resumen-semanal': 'none',
        lotes: 'none',
        mermas: 'edit',
        checklist_produccion: 'none',
        checklist_servicio: 'edit',
        admin_usuarios: 'none',
        admin_ingredientes_y_categorias: 'none',
        admin_tareas_operativas: 'none',
        admin_reportes: 'none',
        admin_permisos: 'none',
    },
    [Role.Cocina]: {
        recetas: 'edit',
        calculadora: 'edit',
        produccion: 'view',
        'resumen-semanal': 'none',
        lotes: 'view',
        mermas: 'edit',
        checklist_produccion: 'view',
        checklist_servicio: 'view',
        admin_usuarios: 'none',
        admin_ingredientes_y_categorias: 'none',
        admin_tareas_operativas: 'none',
        admin_reportes: 'none',
        admin_permisos: 'none',
    },
};
