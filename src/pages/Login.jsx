import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await login(email, password);
        if (res.success) {
            navigate('/profile');
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
            <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/20">
                <div>
                    <div className="mx-auto h-12 w-12 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                        <span className="text-white text-2xl font-black">U</span>
                    </div>
                    <h2 className="text-center text-4xl font-black text-gray-900 tracking-tight uppercase">
                        Welcome Back
                    </h2>
                    <p className="mt-3 text-center text-sm font-medium text-gray-500">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-bold text-primary hover:text-primary-hover transition-colors underline decoration-2 underline-offset-4">
                            Create one
                        </Link>
                    </p>
                </div>
                <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
                    {error && <div className="bg-red-50 text-red-500 text-xs font-bold p-4 rounded-xl text-center border border-red-100 animate-shake">{error}</div>}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email address</label>
                            <input
                                type="email"
                                required
                                className="block w-full px-5 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium placeholder:text-gray-300"
                                placeholder="name@student.ku.edu.np"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                            <input
                                type="password"
                                required
                                className="block w-full px-5 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium placeholder:text-gray-300"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-4 px-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-1 active:translate-y-0"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
