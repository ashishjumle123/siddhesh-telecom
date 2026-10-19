import { useState, useEffect } from 'react';
import BASE_URL from '../api';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, KeyRound } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
    // Step 1 State
    const [email, setEmail] = useState('');

    // Step 2 State
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [timer, setTimer] = useState(0);
    const [loading, setLoading] = useState(false);

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
        setLoading(true);
        try {
            const res = await axios.post(`${BASE_URL}/api/auth/forgot-password-otp`, { email });
            toast.success(res.data?.message || 'Password reset code sent to your email!');
            setStep(2);
            setTimer(30);
            if (res.data?.devOtp) {
                setOtp(res.data.devOtp);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP. Account may not exist.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            toast.error('OTP must be exactly 6 digits');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${BASE_URL}/api/auth/reset-password`, {
                email,
                otp,
                newPassword
            });
            toast.success('Password has been reset successfully! Please log in.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid OTP or Reset Failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (timer > 0) return;
        setLoading(true);
        try {
            await axios.post(`${BASE_URL}/api/auth/forgot-password-otp`, { email });
            toast.success('Verification code resent');
            setTimer(30);
            setOtp('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to resend OTP.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-4 py-8">
            <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {step === 1 ? 'Forgot Password' : 'Reset Password'}
                    </h2>
                    <p className="text-gray-500 text-sm">
                        {step === 1
                            ? 'Enter your email to receive a reset code'
                            : `We sent a 6-digit code to ${email}`
                        }
                    </p>
                </div>

                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="space-y-5">
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
                                    placeholder="you@email.com"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors ${loading ? 'bg-orange-400 cursor-not-allowed' : 'bg-[#fb641b] hover:bg-[#e05615] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#fb641b]'}`}
                        >
                            {loading ? 'Sending Code...' : 'Send Reset Link'}
                        </button>

                        <div className="mt-6 text-center text-sm text-gray-600">
                            Remember your password?{' '}
                            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                                Log in
                            </Link>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Enter 6-digit OTP</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <KeyRound className="h-5 w-5 text-blue-500" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    maxLength="6"
                                    pattern="\d{6}"
                                    className="block w-full text-center pl-10 pr-3 py-3 border-2 border-blue-100 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-lg tracking-[0.5em] font-bold text-gray-900"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                    placeholder="000000"
                                    autoComplete="one-time-code"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6 || newPassword.length < 6}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white transition-colors ${loading || otp.length !== 6 || newPassword.length < 6 ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
                        >
                            {loading ? 'Updating...' : 'Set New Password'}
                        </button>

                        <div className="flex flex-col items-center justify-center space-y-3 pt-2">
                            <span className="text-sm text-gray-500">Didn't receive the code?</span>
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={timer > 0 || loading}
                                className={`text-sm font-medium transition-colors ${timer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-500'}`}
                            >
                                {timer > 0 ? `Resend Code in ${timer}s` : 'Resend Code'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="text-xs text-gray-500 hover:text-gray-700 underline mt-2"
                            >
                                Change email address
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
