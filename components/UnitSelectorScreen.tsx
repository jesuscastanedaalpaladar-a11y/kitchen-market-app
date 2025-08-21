import React from 'react';
import { User, BusinessUnit } from '../types';

interface UnitSelectorScreenProps {
    user: User;
    units: BusinessUnit[];
    onSelectUnit: (unitId: string) => void;
    onLogout: () => void;
}

const UnitSelectorScreen: React.FC<UnitSelectorScreenProps> = ({ user, units, onSelectUnit, onLogout }) => {
    
    const accessibleUnits = user.accessibleUnitIds[0] === '*' 
        ? units 
        : units.filter(u => user.accessibleUnitIds.includes(u.id));

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col justify-center items-center">
            <div className="bg-white dark:bg-slate-800 p-10 rounded-xl shadow-2xl w-full max-w-md text-center border dark:border-slate-700">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Bienvenido, {user.name}</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8">Selecciona la unidad en la que quieres trabajar hoy.</p>
                <div className="space-y-4">
                    {accessibleUnits.map(unit => (
                        <button
                            key={unit.id}
                            onClick={() => onSelectUnit(unit.id)}
                            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-transform transform hover:scale-105"
                        >
                            {unit.name}
                        </button>
                    ))}
                    {user.role === 'Admin' && (
                         <button
                            onClick={() => onSelectUnit('all')}
                            className="w-full bg-slate-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50 transition-transform transform hover:scale-105"
                        >
                            Ver Todas las Unidades (Global)
                        </button>
                    )}
                </div>
                 <button onClick={onLogout} className="mt-8 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:underline">
                    Cerrar sesión
                </button>
            </div>
             <footer className="text-center text-slate-500 dark:text-slate-400 mt-8">
                &copy; {new Date().getFullYear()} KitchenMetrics. Todos los derechos reservados.
            </footer>
        </div>
    );
};

export default UnitSelectorScreen;