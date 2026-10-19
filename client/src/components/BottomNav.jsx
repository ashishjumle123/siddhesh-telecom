import { Link, useLocation } from 'react-router-dom';
import { Home, Heart, Phone, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
    const { user } = useAuth();
    const location = useLocation();

    const getStyle = (path) => {
        return location.pathname === path ? 'text-[#2874f0] font-semibold' : 'text-gray-500 hover:text-[#2874f0]';
    };

    return (
        <nav className="md:hidden fixed bottom-0 left-0 w-full h-[60px] bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.08)] z-50 flex justify-around items-center border-t border-gray-100">
            <Link to="/" className={`flex flex-col items-center w-1/4 ${getStyle('/')}`}>
                <Home className="w-5 h-5 mb-1" />
                <span className="text-[11px] leading-none">Home</span>
            </Link>

            <a
                href="https://wa.me/919923777771?text=Hello%20Siddhesh%20Telecom%20Services,%20I%20have%20an%20inquiry."
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center w-1/4 text-emerald-600 hover:text-emerald-700"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mb-1">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 3.825 0 6.938 3.112 6.938 6.937 0 3.825-3.113 6.938-6.938 6.938z" />
                </svg>
                <span className="text-[11px] leading-none font-semibold">WhatsApp</span>
            </a>

            <Link to="/contact" className={`flex flex-col items-center w-1/4 ${getStyle('/contact')}`}>
                <Phone className="w-5 h-5 mb-1" />
                <span className="text-[11px] leading-none">Contact</span>
            </Link>

            <Link to="/admin" className={`flex flex-col items-center w-1/4 ${getStyle('/admin')}`}>
                <Shield className="w-5 h-5 mb-1" />
                <span className="text-[11px] leading-none font-medium">{user?.role === 'admin' ? 'Admin' : 'Admin Login'}</span>
            </Link>
        </nav>
    );
}
