import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, googleSignIn } = useAuth();
    const { cartItems } = useCart();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const success = await login(email, password);
        if (success) {
            // Get fresh user from localStorage since login() just set it
            const freshUser = JSON.parse(localStorage.getItem('user') || '{}');
            if (freshUser.role === 'admin') {
                navigate('/admin');
            } else if (cartItems && cartItems.length > 0) {
                navigate('/cart');
            } else {
                navigate('/');
            }
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        const success = await googleSignIn(credentialResponse.credential);
        if (success) {
            const freshUser = JSON.parse(localStorage.getItem('user') || '{}');
            if (freshUser.role === 'admin') {
                navigate('/admin');
            } else if (cartItems && cartItems.length > 0) {
                navigate('/cart');
            } else {
                navigate('/');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-4 py-8">
            <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                    <p className="text-gray-500 text-sm">Sign in to Shree-Ganesha Enterprises</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                required
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                required
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="mt-1 text-right">
                            <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-500 font-medium">Forgot password?</Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#fb641b] hover:bg-[#e05615] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#fb641b] transition-colors"
                    >
                        Sign in
                    </button>
                </form>

                <div className="mt-6 flex items-center justify-center">
                    <div className="border-t border-gray-300 w-full"></div>
                    <span className="bg-white px-3 text-sm text-gray-500 font-medium">OR</span>
                    <div className="border-t border-gray-300 w-full"></div>
                </div>

                <div className="mt-6 flex justify-center">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => toast.error('Google Sign-In was unsuccessful')}
                        theme="outline"
                        size="large"
                        width="100%"
                    />
                </div>

                <div className="mt-6 text-center text-sm text-gray-600">
                    New to Shree-Ganesha?{' '}
                    <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                        Create an account
                    </Link>
                </div>
            </div>
        </div>
    );
}
