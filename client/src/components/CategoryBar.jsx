import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import BASE_URL from '../api';

export default function CategoryBar() {
    const scrollRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const checkScroll = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`${BASE_URL}/api/categories`);
                if (Array.isArray(data)) {
                    setCategories(data);
                } else if (data && Array.isArray(data.categories)) {
                    setCategories(data.categories);
                } else {
                    setCategories([]);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        const timer = setTimeout(checkScroll, 500);
        return () => {
            window.removeEventListener('resize', checkScroll);
            clearTimeout(timer);
        };
    }, [categories]);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = direction === 'left' ? -350 : 350;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            setTimeout(checkScroll, 500);
        }
    };

    if (loading) {
        return (
            <div className="bg-white shadow-sm border-b border-gray-100 mb-2 w-full">
                <div className="max-w-[1400px] mx-auto px-4 py-3 flex gap-4 overflow-hidden">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="flex items-center gap-2 shrink-0 animate-pulse">
                            <div className="w-9 h-9 rounded-full bg-gray-200"></div>
                            <div className="w-16 h-4 bg-gray-100 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!Array.isArray(categories) || categories.length === 0) return null;

    return (
        <div className="bg-white shadow-sm border-b border-gray-100 mb-2 relative group w-full">
            <div className="max-w-[1400px] mx-auto relative px-2 py-2 overflow-hidden">
                {/* Left Arrow */}
                {showLeftArrow && (
                    <div className="absolute left-0 top-0 bottom-0 z-10 bg-gradient-to-r from-white via-white/80 to-transparent w-16 flex items-center">
                        <button
                            onClick={() => scroll('left')}
                            className="bg-white shadow-md border border-gray-100 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors ml-1"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-700" />
                        </button>
                    </div>
                )}

                {/* Scrollable Container */}
                <div
                    ref={scrollRef}
                    onScroll={checkScroll}
                    className="flex items-center gap-3 overflow-x-auto scrollbar-hide snap-x scroll-smooth px-4"
                >
                    {categories.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => navigate(item.route)}
                            className="flex items-center gap-2 shrink-0 cursor-pointer snap-start group/item bg-white hover:bg-blue-50/50 px-2 py-1.5 rounded-full border border-transparent hover:border-blue-100 transition-all duration-300"
                        >
                            <div className="w-[36px] h-[36px] rounded-full bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 border border-gray-100 shadow-sm group-hover/item:shadow-md transition-shadow">
                                <img
                                    src={item.image}
                                    loading="lazy"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = `https://ui-avatars.com/api/?name=${item.fallback}&background=f0f5ff&color=2874f0&rounded=true&size=36&font-size=0.4`;
                                    }}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-300"
                                />
                            </div>
                            <span className="text-sm font-medium text-gray-700 group-hover/item:text-[#2874f0] whitespace-nowrap pr-2 transition-colors">
                                {item.name}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Right Arrow */}
                {showRightArrow && (
                    <div className="absolute right-0 top-0 bottom-0 z-10 bg-gradient-to-l from-white via-white/80 to-transparent w-16 flex items-center justify-end">
                        <button
                            onClick={() => scroll('right')}
                            className="bg-white shadow-md border border-gray-100 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors mr-1"
                            aria-label="Scroll right"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-700" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
