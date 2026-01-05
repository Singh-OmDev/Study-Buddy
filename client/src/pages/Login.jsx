import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, ArrowRight } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(email, password);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="flex min-h-[80vh] flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                        <BookOpen className="h-6 w-6 text-black" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-sm text-zinc-500">
                        Sign in to continue your learning journey.
                    </p>
                </div>

                <div className="bento-card p-8 bg-[#111111] border border-[#262626] rounded-2xl shadow-xl">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && <div className="text-red-400 text-sm text-center bg-red-900/10 border border-red-900/20 p-2 rounded-lg">{error}</div>}

                        <div>
                            <label htmlFor="email" className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full rounded-lg border border-[#262626] bg-[#1a1a1a] text-white shadow-sm focus:border-white focus:ring-1 focus:ring-white sm:text-sm px-4 py-3 placeholder-zinc-600 transition-all outline-none"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full rounded-lg border border-[#262626] bg-[#1a1a1a] text-white shadow-sm focus:border-white focus:ring-1 focus:ring-white sm:text-sm px-4 py-3 placeholder-zinc-600 transition-all outline-none"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            className="flex w-full justify-center items-center gap-2 rounded-lg border border-transparent bg-white py-3 px-4 text-sm font-bold text-black shadow hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 transition-all"
                        >
                            Sign in <ArrowRight className="h-4 w-4" />
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-[#262626]">
                        <div className="text-center text-sm">
                            <span className="text-zinc-500">Don't have an account? </span>
                            <Link to="/register" className="font-medium text-white hover:text-zinc-300 transition-colors">
                                Create one here
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
