import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();


    const targetHash = '67d60cfcea9dd92d6ba817cfb7ecea5e8461a369c65ffdecce8eb85cc9263332';

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');

        if (username === 'Santhoshviji') {
            const hashedPass = CryptoJS.SHA256(password).toString();
            if (hashedPass === targetHash) {
                sessionStorage.setItem('adminAuth', 'true');
                navigate('/admin-dashboard');
            } else {
                setError('Invalid credentials');
            }
        } else {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-brand-darkbg flex items-center justify-center p-6 transition-colors">
            <div className="w-full max-w-md bg-white dark:bg-brand-darkcard p-8 rounded-[2rem] shadow-ouali-card border border-brand-border dark:border-brand-darkborder">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-brand-dark dark:text-white mb-2">Admin Login</h1>
                    <p className="text-brand-gray dark:text-gray-400">Secure access to portfolio management</p>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm font-medium text-center border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-brand-dark dark:text-white">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-brand-lightbg dark:bg-gray-900 text-brand-dark dark:text-white px-5 py-3 rounded-xl border border-transparent dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all"
                            placeholder="Enter username"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-brand-dark dark:text-white">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-brand-lightbg dark:bg-gray-900 text-brand-dark dark:text-white px-5 py-3 rounded-xl border border-transparent dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all"
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary w-full mt-4 !bg-orange-600 hover:!bg-orange-700 !shadow-orange-500/30">
                        Secure Login
                    </button>
                </form>
            </div>
        </div>
    );
}
