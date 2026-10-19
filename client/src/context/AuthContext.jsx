import { createContext, useState, useEffect, useContext } from 'react';
import BASE_URL from '../api';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('user');
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            return null;
        }
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) return;

        // Verify token in the background silently without blocking the UI
        fetch(`${BASE_URL}/api/auth/profile`, {
            headers: { 'Authorization': `Bearer ${storedToken}` }
        }).then(async res => {
            if (res.ok) {
                const profile = await res.json();
                const freshUser = { _id: profile.id || profile._id, name: profile.name, email: profile.email, role: profile.role };
                setUser(freshUser);
                localStorage.setItem('user', JSON.stringify(freshUser));
            } else if (res.status === 401) {
                // Only clear if server explicitly told us the token is invalid
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
                setToken(null);
            }
        }).catch(() => {
            // Network failure - trust localStorage cache to keep store offline/fast
        });
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${BASE_URL}/api/auth/login`, {
                email,
                password
            });

            const data = response.data;
            const userPayload = { _id: data._id, name: data.name, email: data.email, role: data.role };

            setUser(userPayload);
            setToken(data.token);

            localStorage.setItem('user', JSON.stringify(userPayload));
            localStorage.setItem('token', data.token);

            toast.success(`Welcome back, ${data.name}!`);
            return true;

        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
            return false;
        }
    };

    // Step 1 of OTP Flow
    const sendOtp = async (email) => {
        try {
            const res = await axios.post(`${BASE_URL}/api/auth/send-otp`, { email });
            toast.success(res.data?.message || 'Verification code sent to your email!');
            return { success: true, devOtp: res.data?.devOtp };
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP. Please try again.');
            return { success: false };
        }
    };

    // Step 2 of OTP Flow
    const verifyOtp = async (name, email, password, otp) => {
        try {
            const response = await axios.post(`${BASE_URL}/api/auth/verify-otp`, {
                name, email, password, otp
            });

            const data = response.data;
            const userPayload = { _id: data._id, name: data.name, email: data.email, role: data.role };

            setUser(userPayload);
            setToken(data.token);

            localStorage.setItem('user', JSON.stringify(userPayload));
            localStorage.setItem('token', data.token);

            toast.success('Email verified successfully! Welcome to Siddhesh Telecome Services.');
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid or expired OTP.');
            return false;
        }
    };

    // Kept for backward compatibility
    const register = async (name, email, password) => {
        try {
            const response = await axios.post(`${BASE_URL}/api/auth/register`, {
                name, email, password
            });

            const data = response.data;
            const userPayload = { _id: data._id, name: data.name, email: data.email, role: data.role };

            setUser(userPayload);
            setToken(data.token);

            localStorage.setItem('user', JSON.stringify(userPayload));
            localStorage.setItem('token', data.token);

            toast.success('Registration successful! Welcome to Siddhesh Telecome Services.');
            return true;

        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
            return false;
        }
    };

    const googleSignIn = async (googleToken) => {
        try {
            const response = await axios.post(`${BASE_URL}/api/auth/google`, {
                tokenId: googleToken
            });

            const data = response.data;
            const userPayload = { _id: data._id, name: data.name, email: data.email, role: data.role };

            setUser(userPayload);
            setToken(data.token);

            localStorage.setItem('user', JSON.stringify(userPayload));
            localStorage.setItem('token', data.token);

            toast.success(`Welcome back, ${data.name}!`);
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Google Sign-In failed');
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('guestCart'); // Clear guest cart on logout
        toast.success('Logged out successfully');
    };

    const updateUser = (userData) => {
        const newUser = { ...user, ...userData };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, sendOtp, verifyOtp, googleSignIn, logout, loading, updateUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
