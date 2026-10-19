import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

function AdminLoginForm() {
    const { login } = useAuth();
    const [email, setEmail] = useState('siddheshtelecomdigital@gmail.com');
    const [password, setPassword] = useState('@9923777771');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const success = await login(email, password);
            if (success) {
                toast.success('Admin logged in successfully!');
            }
        } catch (err) {
            toast.error('Login failed. Please check credentials.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col justify-center items-center px-4 py-12">
            <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 bg-blue-100 text-[#2874f0] rounded-2xl mb-3 shadow-inner">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Admin Control Panel</h2>
                    <p className="text-gray-500 text-sm mt-1">Siddhesh Telecom Digital</p>
                    <p className="text-xs text-blue-600 font-medium mt-0.5">Manage Products, Categories & Store</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-11 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50/50"
                                placeholder="siddheshtelecomdigital@gmail.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-11 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50/50"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#2874f0] hover:bg-blue-600 active:scale-[0.99] transition shadow-lg shadow-blue-500/25 disabled:opacity-70 cursor-pointer"
                    >
                        {submitting ? 'Authenticating...' : (
                            <>
                                Access Admin Dashboard <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-4 border-t border-gray-100 text-center">
                    <a href="/" className="text-xs text-gray-500 hover:text-gray-800 transition">
                        ← Back to Website Homepage
                    </a>
                </div>
            </div>
        </div>
    );
}

export default function AdminRoute() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2874f0]"></div>
            </div>
        );
    }

    if (!user || user.role !== 'admin') {
        return <AdminLoginForm />;
    }

    return <Outlet />;
}
