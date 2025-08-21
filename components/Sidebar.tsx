
import React from 'react';
import { NavLink } from 'react-router-dom';
import { User, AppModule } from '../types';
import { RecipeIcon, ProductionIcon, ChecklistIcon, BatchIcon, UserIcon, ReportIcon, ServiceIcon, CalculatorIcon, CalendarIcon, WasteIcon, IngredientIcon, TagIcon } from './icons';

interface SidebarProps {
    user: User;
    hasPermission: (module: AppModule, requiredLevel: 'view' | 'edit') => boolean;
    isSuperAdmin: boolean;
}

const commonLinkClasses = "flex items-center justify-center h-14 w-14 rounded-xl transition-colors duration-200 relative group";
const activeLinkClasses = "bg-indigo-600 text-white shadow-lg";
const inactiveLinkClasses = "text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-white";

const NavItem: React.FC<{ to: string; title: string; children: React.ReactNode }> = ({ to, title, children }) => (
    <li>
        <NavLink
            to={to}
            title={title}
            className={({ isActive }) => `${commonLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
        >
            {children}
            <span className="absolute left-full ml-4 w-auto min-w-max p-2 text-xs font-bold text-white bg-slate-800 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                {title}
            </span>
        </NavLink>
    </li>
);

const Sidebar: React.FC<SidebarProps> = ({ user, hasPermission, isSuperAdmin }) => {
    
    const showAdminHeader = isSuperAdmin || hasPermission('admin_usuarios', 'view') || hasPermission('admin_ingredientes_y_categorias', 'view') || hasPermission('admin_tareas_operativas', 'view') || hasPermission('admin_reportes', 'view') || hasPermission('mermas', 'view');

    return (
        <aside className="hidden md:flex w-20 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex-col items-center py-6 fixed h-full z-40">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-10">
                KM
            </div>
            
            <nav className="flex-1 w-full">
                <ul className="space-y-4 px-3">
                    {hasPermission('produccion', 'view') && <NavItem to="/produccion" title="Mi Día"><ProductionIcon /></NavItem>}
                    {hasPermission('resumen-semanal', 'view') && <NavItem to="/resumen-semanal" title="Resumen Semanal"><CalendarIcon /></NavItem>}
                    {hasPermission('recetas', 'view') && <NavItem to="/recetas" title="Recetario"><RecipeIcon /></NavItem>}
                    {hasPermission('calculadora', 'view') && <NavItem to="/calculadora" title="Calculadora"><CalculatorIcon /></NavItem>}
                    {hasPermission('checklist_produccion', 'view') && <NavItem to="/checklist-produccion" title="Checklist (Producción)"><ChecklistIcon /></NavItem>}
                    {hasPermission('checklist_servicio', 'view') && <NavItem to="/checklist-servicio" title="Checklist (Servicio)"><ServiceIcon/></NavItem>}
                    {hasPermission('lotes', 'view') && <NavItem to="/lotes" title="Lotes"><BatchIcon /></NavItem>}
                    {hasPermission('mermas', 'view') && <NavItem to="/mermas" title="Registro Mermas"><WasteIcon /></NavItem>}

                    {showAdminHeader && (
                        <>
                            <hr className="my-6 border-slate-200 dark:border-slate-700" />
                            {hasPermission('admin_ingredientes_y_categorias', 'view') && <NavItem to="/admin/ingredientes" title="Ingredientes"><IngredientIcon /></NavItem>}
                            {hasPermission('admin_ingredientes_y_categorias', 'view') && <NavItem to="/admin/categorias" title="Categorías"><TagIcon /></NavItem>}
                            {hasPermission('admin_usuarios', 'view') && <NavItem to="/admin/usuarios" title="Usuarios"><UserIcon /></NavItem>}
                            {hasPermission('admin_tareas_operativas', 'view') && <NavItem to="/admin/tareas-operativas" title="Tareas Operativas"><ChecklistIcon /></NavItem>}
                            {hasPermission('admin_reportes', 'view') && <NavItem to="/admin/reportes" title="Reportes"><ReportIcon /></NavItem>}
                            {hasPermission('mermas', 'view') && <NavItem to="/reporte-mermas" title="Reporte Mermas"><ReportIcon /></NavItem>}
                            {isSuperAdmin && <NavItem to="/admin/permisos" title="Permisos"><UserIcon /></NavItem>}
                        </>
                    )}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;