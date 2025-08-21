
import React, { useState } from 'react';

interface LoginScreenProps {
    onLogin: (email: string) => boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = onLogin(email);
        if (!success) {
            setError('Correo electrónico incorrecto.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-800 p-8 sm:p-10 rounded-xl shadow-lg w-full max-w-md text-center border dark:border-slate-700">
                <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-2">KitchenMetrics</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8">Inicia sesión para continuar</p>
                
                {error && <p className="bg-red-100 dark:bg-red-900/50 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative mb-6 text-sm" role="alert">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Correo electrónico"
                            className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-lg py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white font-bold text-lg py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                        Iniciar Sesión
                    </button>
                </form>
            </div>
            <footer className="text-center text-slate-500 dark:text-slate-400 mt-8 text-sm">
                &copy; {new Date().getFullYear()} KitchenMetrics. Todos los derechos reservados.
            </footer>
        </div>
    );
};

export default LoginScreen;
