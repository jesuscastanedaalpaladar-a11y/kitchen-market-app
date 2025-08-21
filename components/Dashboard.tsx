
import React, { useState, useEffect, useRef } from 'react';
import { User, BusinessUnit, AppModule, Role } from '../types';
import Sidebar from './Sidebar';
import { SunIcon, MoonIcon, LogoutIcon } from './icons';

interface HeaderProps {
    user: User;
    onLogout: () => void;
    activeUnitId: string;
    setActiveUnitId: (unitId: string) => void;
    businessUnits: BusinessUnit[];
    theme: string;
    toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, activeUnitId, setActiveUnitId, businessUnits, theme, toggleTheme }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    const canSwitchUnits = user.role === Role.Admin || user.accessibleUnitIds.length > 1;
    const accessibleUnits = user.accessibleUnitIds[0] === '*' 
        ? businessUnits 
        : businessUnits.filter(u => user.accessibleUnitIds.includes(u.id));
    const currentUnitName = activeUnitId === 'all' ? 'Vista Global' : businessUnits.find(u => u.id === activeUnitId)?.name;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);


    return (
        <header className="fixed top-0 left-0 md:left-20 right-0 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 z-30 flex items-center justify-between px-6">
             <div>
                {canSwitchUnits ? (
                     <div className="flex items-center space-x-2">
                        <label htmlFor="unit-switcher" className="text-sm font-semibold text-slate-500 dark:text-slate-400">Unidad:</label>
                        <select 
                            id="unit-switcher"
                            value={activeUnitId}
                            onChange={(e) => setActiveUnitId(e.target.value)}
                            className="p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 dark:text-white"
                        >
                            {user.role === Role.Admin && <option value="all">Vista Global</option>}
                            {accessibleUnits.map(unit => (
                                <option key={unit.id} value={unit.id}>{unit.name}</option>
                            ))}
                        </select>
                    </div>
                ) : (
                    <p className="text-md font-semibold text-slate-700 dark:text-slate-300">{currentUnitName}</p>
                )}
             </div>

            <div className="relative" ref={dropdownRef}>
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                     <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400">
                        {user.name.charAt(0)}
                    </div>
                    <div className="hidden md:block text-left">
                        <p className="font-semibold text-slate-800 dark:text-white">{user.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{user.role}</p>
                    </div>
                </button>
                {isDropdownOpen && (
                     <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl border dark:border-slate-700 py-1">
                        <div className="px-4 py-2 border-b dark:border-slate-600">
                             <p className="font-semibold text-slate-800 dark:text-white">{user.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                        </div>
                         <button
                            onClick={toggleTheme}
                            className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                            <span>Cambiar Tema</span>
                            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                        </button>
                        <button onClick={onLogout} className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30">
                            <LogoutIcon />
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                )}
            </div>
        </header>
    )
}


interface DashboardProps {
    user: User;
    onLogout: () => void;
    children: React.ReactNode;
    activeUnitId: string;
    setActiveUnitId: (unitId: string) => void;
    businessUnits: BusinessUnit[];
    hasPermission: (module: AppModule, requiredLevel: 'view' | 'edit') => boolean;
    isSuperAdmin: boolean;
    theme: string;
    toggleTheme: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, children, activeUnitId, setActiveUnitId, businessUnits, hasPermission, isSuperAdmin, theme, toggleTheme }) => {
    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans">
            <Sidebar 
                user={user} 
                hasPermission={hasPermission}
                isSuperAdmin={isSuperAdmin}
            />
            <div className="flex-1 flex flex-col overflow-hidden pl-0 md:pl-20">
                <Header 
                    user={user}
                    onLogout={onLogout}
                    activeUnitId={activeUnitId}
                    setActiveUnitId={setActiveUnitId}
                    businessUnits={businessUnits}
                    theme={theme}
                    toggleTheme={toggleTheme}
                />
                 <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pt-24">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;