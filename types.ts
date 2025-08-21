
export interface BusinessUnit {
    id: string;
    name: string;
    type: 'branch' | 'production';
}

export enum Role {
    Admin = 'Admin',
    Produccion = 'Producción',
    Servicio = 'Servicio',
    Cocina = 'Cocina'
}

export enum RecipeType {
    Produccion = 'Producción',
    Servicio = 'Servicio',
}

export enum Unit {
    g = 'g',
    kg = 'kg',
    L = 'L',
    pzas = 'pzas',
    ord = 'ord'
}

export interface MasterIngredient {
    id: string;
    name: string;
    category: string;
    unit: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: Role;
    accessibleUnitIds: string[]; // List of BusinessUnit IDs, or ['*'] for all
    permissionOverrides?: {
        [module in AppModule]?: PermissionLevel;
    };
}

export interface Ingredient {
    ingredientId: string;
    ingredientName: string;
    quantity: number;
    unit: Unit;
}

export interface RecipeStep {
    description: string;
}

export interface Recipe {
    id: string;
    name: string;
    category: string;
    type: RecipeType;
    ingredients: Ingredient[];
    steps: RecipeStep[];
    prepTimeMinutes: number;
    expectedYield: number;
    yieldUnit: string;
    photoUrl?: string;
    videoUrl?: string;
    shelfLifeDays: number;
}

export interface ProductionTask {
    id: string;
    recipeId: string;
    recipeName: string;
    quantityToProduce: number;
    unit: string;
    priority: number;
    status: 'Pendiente' | 'En progreso' | 'Completado';
    assignedUserId?: number;
    unitId: string;
}

export interface Batch {
    id: string;
    recipeId: string;
    recipeName: string;
    productionDate: string;
    responsibleUser: string;
    shelfLifeDays: number;
    quantity: number;
    unit: string;
    status: 'Activo' | 'Caducado';
    durationSeconds: number;
    sourceTaskId?: string;
    notes?: string;
    unitId: string;
}

export enum WasteType {
    Preparacion = 'Preparación',
    Porcionado = 'Porcionado',
    Caducidad = 'Caducidad',
    Sobreproduccion = 'Sobreproducción',
    Otro = 'Otro',
}

export interface Waste {
    id: string;
    date: string; // ISO string
    unitId: string;
    type: WasteType;
    relatedRecipeOrBatchId?: string;
    relatedRecipeOrBatchName?: string;
    description?: string;
    quantity: number;
    unit: string;
    responsibleUser: string;
}

export enum TaskFrequency {
    Diaria = 'Diaria',
    Semanal = 'Semanal',
    Mensual = 'Mensual',
}

export enum TaskStatus {
    Pendiente = 'Pendiente',
    EnProgreso = 'En Progreso',
    Completado = 'Completado',
}

export interface OperationalTaskTemplate {
    id: string;
    name: string;
    description: string;
    frequency: TaskFrequency;
    assignedRole: Role;
}

export interface OperationalTask {
    id: string;
    templateId: string;
    name: string;
    description: string;
    date: string; // ISO String
    status: TaskStatus;
    assignedRole: Role;
    unitId: string;
}

export interface CategorySummary {
    name: string;
    count: number;
}

// New types for permission management
export type AppModule =
  | 'recetas'
  | 'calculadora'
  | 'produccion'
  | 'resumen-semanal'
  | 'lotes'
  | 'mermas'
  | 'checklist_produccion'
  | 'checklist_servicio'
  | 'admin_usuarios'
  | 'admin_ingredientes_y_categorias'
  | 'admin_tareas_operativas'
  | 'admin_reportes'
  | 'admin_permisos';

export type PermissionLevel = 'edit' | 'view' | 'none';

export type RolePermissions = {
    [key in Role]: {
        [module in AppModule]?: PermissionLevel;
    };
};
