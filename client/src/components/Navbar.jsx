import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Search, ShoppingCart, User, Layers, ChevronDown, Heart, Package, LogOut, Settings, Menu, X, Phone, Home as HomeIcon } from 'lucide-react';
import siddheshLogo from '../assets/siddhesh-telecom-logo.jpg';

export default function Navbar() {
    const { totalItems } = useCart();
    const { user, logout } = useAuth();

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [keyword, setKeyword] = useState(searchParams.get('search') || '');

    // Mobile search and menu toggles
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const firstName = user?.name ? user.name.split(' ')[0] : '';

    const handleSearch = (e) => {
        e.preventDefault();
        if (keyword.trim()) {
            navigate(`/?search=${encodeURIComponent(keyword)}`);
            setIsMobileSearchOpen(false);
        } else {
            navigate('/');
        }
    };

    return (
        <nav className="bg-[#2874f0] text-white p-2.5 sm:p-3 shadow-md sticky top-0 z-50">
            {/* Desktop & Mobile Main Row */}
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">

                {/* Mobile Menu Button & Brand */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <button className="md:hidden p-1 hover:bg-blue-600 rounded transition-colors" onClick={() => setIsMobileMenuOpen(true)} aria-label="Open navigation menu">
                        <Menu className="w-6 h-6 text-white" />
                    </button>

                    <Link to="/" className="flex items-center gap-2 sm:gap-2.5 text-white hover:opacity-95 transition-opacity">
                        {/* Siddhesh Telecom Services Logo */}
                        <img
                            src={siddheshLogo}
                            alt="Siddhesh Telecom Services"
                            className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full object-cover shadow-sm ring-2 ring-white/40 shrink-0"
                        />
                        <div className="flex flex-col">
                            <span className="font-bold text-sm sm:text-base md:text-lg lg:text-xl tracking-tight leading-tight whitespace-nowrap">
                                <span className="hidden sm:inline">Siddhesh Telecom Services</span>
                                <span className="sm:hidden">Siddhesh Telecom</span>
                            </span>
                            <span className="text-[10px] text-blue-100 hidden md:block italic tracking-wider leading-none">
                                Jejuri • Purandhar
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Desktop Search Bar */}
                <div className="hidden md:block flex-1 max-w-2xl relative">
                    <form onSubmit={handleSearch}>
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="Search for products, brands and more"
                            className="w-full py-2 px-4 pr-10 rounded-sm bg-white text-sm text-gray-900 border-none focus:outline-none focus:shadow-md"
                        />
                        <button type="submit" className="absolute right-3 top-2">
                            <Search className="w-5 h-5 text-[#2874f0]" />
                        </button>
                    </form>
                </div>

                {/* Mobile Search & Cart Icons right side */}
                <div className="flex md:hidden items-center gap-4">
                    <button onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}>
                        <Search className="w-6 h-6 text-white" />
                    </button>
                    <Link to="/cart" className="relative">
                        <ShoppingCart className="w-6 h-6 text-white" />
                        {totalItems > 0 && (
                            <span className="absolute -top-2 -right-2 bg-[#ff6161] text-[10px] w-4 h-4 flex items-center justify-center rounded-full text-white font-bold">
                                {totalItems}
                            </span>
                        )}
                    </Link>
                </div>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-6 text-sm font-medium">

                    {/* <Link to="/category/tv" className="flex items-center gap-1 hover:text-gray-200 transition-colors">
                        <Layers className="w-4 h-4" /> Categories
                    </Link> */}

                    {/* WhatsApp Quick Link */}
                    <a
                        href="https://wa.me/919923777771?text=Hello%20Siddhesh%20Telecom%20Services,%20I%20have%20an%20inquiry."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-[#25D366] text-white px-3.5 py-1.5 rounded-full font-bold hover:bg-[#20ba59] transition-colors shadow-xs"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 3.825 0 6.938 3.112 6.938 6.937 0 3.825-3.113 6.938-6.938 6.938z" />
                        </svg>
                        <span>WhatsApp</span>
                    </a>

                    <Link to="/contact" className="hover:text-gray-200 transition-colors">
                        Contact Us
                    </Link>

                    {user?.role === 'admin' ? (
                        <div className="flex items-center gap-3">
                            <Link to="/admin" className="bg-white text-[#2874f0] px-4 py-1.5 rounded-sm font-bold hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-1.5">
                                <Settings className="w-4 h-4" /> Admin Panel
                            </Link>
                            <button onClick={logout} className="text-white hover:text-red-200 text-xs font-semibold cursor-pointer">
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link to="/admin" className="text-white/80 hover:text-white text-xs border border-white/30 px-3 py-1 rounded-sm hover:border-white transition-colors">
                            Admin Login
                        </Link>
                    )}
                </div>
            </div>

            {/* Mobile Expandable Search Bar */}
            {isMobileSearchOpen && (
                <div className="md:hidden mt-3 max-w-2xl relative animate-fadeIn">
                    <form onSubmit={handleSearch}>
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="Search for products, brands and more"
                            className="w-full py-2 px-4 pr-10 rounded-sm bg-white text-sm text-gray-900 border-none focus:outline-none shadow-sm"
                            autoFocus
                        />
                        <button type="submit" className="absolute right-3 top-2">
                            <Search className="w-5 h-5 text-[#2874f0]" />
                        </button>
                    </form>
                </div>
            )}

            {/* Mobile Menu Drawer Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-[100] md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                    <div
                        className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white text-gray-900 shadow-xl flex flex-col transform transition-transform duration-300"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Drawer Header */}
                        <div className="bg-[#2874f0] p-4 text-white flex justify-between items-center">
                            {user ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white text-[#2874f0] rounded-full flex items-center justify-center font-bold text-lg">
                                        {firstName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{user.name}</p>
                                        <p className="text-xs text-blue-100">{user.email}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <img
                                        src={siddheshLogo}
                                        alt="Siddhesh Telecom"
                                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white/50 shadow-sm shrink-0"
                                    />
                                    <div>
                                        <p className="font-semibold text-sm">Siddhesh Telecom</p>
                                        <p className="text-xs text-blue-100">Catalog & Inquiries</p>
                                    </div>
                                </div>
                            )}
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-1">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Drawer Links */}
                        <div className="flex-1 overflow-y-auto py-2">
                            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50">
                                <HomeIcon className="w-5 h-5 text-gray-500" />
                                <span>Home</span>
                            </Link>
                            
                            <a 
                                href="https://wa.me/919923777771?text=Hello%20Siddhesh%20Telecom%20Services,%20I%20have%20an%20inquiry."
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setIsMobileMenuOpen(false)} 
                                className="flex items-center gap-4 px-4 py-3 text-emerald-600 hover:bg-emerald-50 font-medium"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 3.825 0 6.938 3.112 6.938 6.937 0 3.825-3.113 6.938-6.938 6.938z" />
                                </svg>
                                <span>WhatsApp Inquiry</span>
                            </a>

                            <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50">
                                <Phone className="w-5 h-5 text-gray-500" />
                                <span>Contact Us</span>
                            </Link>

                            <hr className="my-2 border-gray-100" />

                            {user?.role === 'admin' ? (
                                <>
                                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 hover:bg-blue-50 text-[#2874f0] font-semibold">
                                        <Settings className="w-5 h-5 text-[#2874f0]" />
                                        <span>Admin Panel</span>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            logout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-4 px-4 py-3 hover:bg-red-50 text-red-600 font-medium"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span>Logout</span>
                                    </button>
                                </>
                            ) : (
                                <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 text-gray-600 text-sm">
                                    <Settings className="w-5 h-5 text-gray-400" />
                                    <span>Admin Login</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
