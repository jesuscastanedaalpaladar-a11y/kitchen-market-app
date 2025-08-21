import React from 'react';
import { Link } from 'react-router-dom';

const AccessDenied: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white dark:bg-slate-800 rounded-lg shadow-sm border dark:border-slate-700">
            <h1 className="text-4xl font-bold text-red-600">Acceso Denegado</h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">No tienes los permisos necesarios para ver esta página.</p>
            <p className="mt-2 text-slate-500 dark:text-slate-400">Contacta a un administrador si crees que esto es un error.</p>
            <Link 
                to="/" 
                className="mt-8 px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition"
            >
                Volver al inicio
            </Link>
        </div>
    );
};

export default AccessDenied;