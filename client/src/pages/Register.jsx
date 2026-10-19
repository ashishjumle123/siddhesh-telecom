import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, KeyRound, CheckCircle2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';

export default function Register() {
    // State
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');

    const [step, setStep] = useState(1);
    const [timer, setTimer] = useState(0);
    const [loading, setLoading] = useState(false);

    const { sendOtp, verifyOtp, googleSignIn } = useAuth();
    const { cartItems } = useCart();
    const navigate = useNavigate();

    // Timer effect
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleSendOtp = async (e) => {
        e.preventDefault();

        // Basic email validation before sending
        if (!email.includes('@')) {
            toast.error('Please enter a valid email address');
            return;
        }

        setLoading(true);
        const result = await sendOtp(email);
        setLoading(false);

        if (result?.success || result === true) {
            setStep(2);
            setTimer(60); // 60 second lock out for resending
            if (result?.devOtp) {
                setOtp(result.devOtp);
            }
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            toast.error('OTP must be exactly 6 digits');
            return;
        }

        setLoading(true);
        const success = await verifyOtp(username, email, password, otp);
        setLoading(false);

        if (success) {
            if (cartItems && cartItems.length > 0) {
                navigate('/cart');
            } else {
                navigate('/my-orders');
            }
        }
    };

    const handleResendOtp = async () => {
        if (timer > 0) return;
        setLoading(true);
        const success = await sendOtp(email);
        setLoading(false);

        if (success) {
            setTimer(60);
            setOtp('');
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        const success = await googleSignIn(credentialResponse.credential);
        if (success) {
            if (cartItems && cartItems.length > 0) {
                navigate('/cart');
            } else {
                navigate('/my-orders');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-4 py-8">
            <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md p-6 border-t-4 border-[#fb641b]">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h2>
                    <p className="text-gray-500 text-sm">
                        {step === 1 ? 'Step 1: Verify your email address' : 'Step 2: Complete your profile'}
                    </p>
                </div>

                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="space-y-5">
                        <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mb-6 flex items-start">
                            <CheckCircle2 className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
                            <p>To ensure security, please verify your email address before creating an account.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-[#fb641b] focus:border-[#fb641b] sm:text-base outline-none transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email ID"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !email}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-bold text-white transition-colors ${loading || !email ? 'bg-orange-300 cursor-not-allowed' : 'bg-[#fb641b] hover:bg-[#e05615] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#fb641b]'}`}
                        >
                            {loading ? 'Sending OTP...' : 'Send OTP to Verify'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleRegister} className="space-y-5">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                <button type="button" onClick={() => setStep(1)} className="text-xs text-blue-600 font-medium hover:underline">Change</button>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    disabled
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 sm:text-sm cursor-not-allowed"
                                    value={email}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">Enter Email OTP</label>
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={timer > 0 || loading}
                                    className={`text-xs font-medium ${timer > 0 ? 'text-gray-400' : 'text-blue-600 hover:text-blue-800'}`}
                                >
                                    {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                                </button>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <KeyRound className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    maxLength="6"
                                    pattern="\d{6}"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#fb641b] focus:border-[#fb641b] sm:text-lg tracking-widest font-mono font-medium outline-none"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                    placeholder="000000"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#fb641b] focus:border-[#fb641b] sm:text-sm outline-none"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Ravi Kumar"
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
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#fb641b] focus:border-[#fb641b] sm:text-sm outline-none"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Create a strong password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6 || !username || !password}
                            className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white transition-colors ${loading || otp.length !== 6 || !username || !password ? 'bg-orange-300 cursor-not-allowed' : 'bg-[#fb641b] hover:bg-[#e05615] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#fb641b]'}`}
                        >
                            {loading ? 'Verifying & Creating Account...' : 'Sign Up'}
                        </button>
                    </form>
                )}

                {step === 1 && (
                    <>
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
                                text="signup_with"
                            />
                        </div>
                    </>
                )}

                <div className="mt-8 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-[#fb641b] hover:text-[#e05615]">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
