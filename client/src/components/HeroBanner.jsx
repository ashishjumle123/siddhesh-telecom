import { useState, useEffect } from 'react';
import BASE_URL from '../api';
import { ChevronLeft, ChevronRight, Image as ImageIcon, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function HeroBanner() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [banners, setBanners] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${BASE_URL}/api/banners`);
            if (Array.isArray(res.data)) {
                setBanners(res.data);
            } else {
                setBanners([]);
            }
        } catch (error) {
            console.error('Failed to fetch banners:', error);
            setBanners([]);
        } finally {
            setLoading(false);
        }
    };

    const nextSlide = () => {
        if (banners.length <= 1) return;
        setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        if (banners.length <= 1) return;
        setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    };

    useEffect(() => {
        if (banners.length <= 1) return;
        const slideInterval = setInterval(nextSlide, 4500);
        return () => clearInterval(slideInterval);
    }, [banners.length]);

    const handleBannerClick = (e, link) => {
        if (!link || link === '#' || link === '/') return;

        if (link.startsWith('http://') || link.startsWith('https://')) {
            window.open(link, '_blank', 'noopener,noreferrer');
        } else {
            e.preventDefault();
            navigate(link);
        }
    };

    if (loading) {
        return (
            <div className="w-full max-w-[1400px] mx-auto px-2 md:px-4 mb-4">
                <div className="w-full aspect-[3/1] md:aspect-[1600/280] bg-gray-200 animate-pulse rounded-lg"></div>
            </div>
        );
    }

    // If no banners exist
    if (!banners || banners.length === 0) {
        // If user is admin, show convenient shortcut
        if (user?.role === 'admin') {
            return (
                <div className="w-full max-w-[1400px] mx-auto px-2 md:px-4 mb-4">
                    <div className="bg-white border-2 border-dashed border-blue-200 rounded-lg p-6 text-center shadow-xs">
                        <ImageIcon className="w-8 h-8 text-[#2874f0] mx-auto mb-2 opacity-80" />
                        <h4 className="text-sm font-semibold text-gray-800">No Homepage Banners Active</h4>
                        <p className="text-xs text-gray-500 mt-1 mb-3">
                            Upload banners from your Admin Panel to showcase offers below the category bar.
                        </p>
                        <Link
                            to="/admin"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-[#2874f0] hover:bg-blue-600 px-3.5 py-1.5 rounded-md transition"
                        >
                            <Settings className="w-3.5 h-3.5" /> Go to Admin Panel → Manage Banners
                        </Link>
                    </div>
                </div>
            );
        }
        return null;
    }

    return (
        <div className="relative w-full max-w-[1400px] mx-auto group mb-4 px-2 md:px-4 flex flex-col items-center">
            {/* Banner Slider Container */}
            <div className="overflow-hidden relative w-full rounded-lg shadow-sm aspect-[3/1] md:aspect-[1600/280] bg-gray-100">
                <div
                    className="flex transition-transform duration-500 ease-in-out h-full"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                    {banners.map((banner, idx) => (
                        <div
                            key={banner._id || idx}
                            className="w-full shrink-0 h-full relative cursor-pointer select-none"
                            onClick={(e) => handleBannerClick(e, banner.link)}
                        >
                            <img
                                src={banner.image}
                                alt={banner.alt || 'Promotional Banner'}
                                className="w-full h-full object-cover md:object-fill"
                            />
                        </div>
                    ))}
                </div>

                {/* Left/Right Controls */}
                {banners.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                            aria-label="Previous Slide"
                            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 md:p-4 rounded-r-md shadow-md opacity-0 group-hover:opacity-100 transition-all z-10"
                        >
                            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                            aria-label="Next Slide"
                            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 md:p-4 rounded-l-md shadow-md opacity-0 group-hover:opacity-100 transition-all z-10"
                        >
                            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                        </button>

                        {/* Indicators */}
                        <div className="absolute bottom-2 md:bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                            {banners.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={(e) => { e.stopPropagation(); setCurrentSlide(index); }}
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                        currentSlide === index ? 'w-6 bg-white shadow-sm' : 'w-2 bg-white/60 hover:bg-white/80'
                                    }`}
                                    aria-label={`Slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Admin Shortcut Pill */}
                {user?.role === 'admin' && (
                    <Link
                        to="/admin"
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white text-[11px] px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1 transition z-20"
                        title="Manage Banners in Admin Panel"
                    >
                        <Settings className="w-3 h-3" />
                        <span>Manage</span>
                    </Link>
                )}
            </div>
        </div>
    );
}
