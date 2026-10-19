import { useState, useEffect } from 'react';
import BASE_URL from '../api';
import { ChevronLeft, ChevronRight, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function HeroBanner() {
    const { user, token } = useAuth();
    const [banners, setBanners] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/banners`);
            if (Array.isArray(res.data)) {
                setBanners(res.data);
            } else {
                setBanners([]);
            }
        } catch (error) {
            console.error("Failed to fetch banners");
            setBanners([]);
        } finally {
            setLoading(false);
        }
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    };

    useEffect(() => {
        if (banners.length <= 1) return;
        const slideInterval = setInterval(nextSlide, 4000);
        return () => clearInterval(slideInterval);
    }, [banners.length]);

    const handleDeleteBanner = async (id) => {
        if (!window.confirm("Are you sure you want to remove this banner?")) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`${BASE_URL}/api/banners/${id}`, config);
            toast.success("Banner removed successfully");
            fetchBanners();
            setCurrentSlide(0);
        } catch (error) {
            toast.error("Failed to remove banner");
        }
    };

    const handleUploadBanner = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('images', file);

        try {
            setUploading(true);
            const uploadConfig = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };
            const jsonConfig = { headers: { Authorization: `Bearer ${token}` } };

            // Upload to our upload route (Cloudinary fallback)
            const { data: uploadedUrls } = await axios.post(`${BASE_URL}/api/upload`, formData, uploadConfig);

            if (uploadedUrls && uploadedUrls.length > 0) {
                // Save DB
                await axios.post(`${BASE_URL}/api/banners`, {
                    image: uploadedUrls[0],
                    alt: "New Banner",
                    link: "/"
                }, jsonConfig);
                toast.success('Banner added successfully!');
                fetchBanners();
                setCurrentSlide(0);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add banner');
        } finally {
            setUploading(false);
            e.target.value = null;
        }
    };

    if (loading || !Array.isArray(banners) || banners.length === 0) return null;

    return (
        <div className="relative w-full max-w-[1400px] mx-auto group mb-4 px-2 md:px-4 flex flex-col items-center">
            {/* Admin Controls */}
            {user?.role === 'admin' && (
                <div className="w-full mb-2 flex justify-between items-center bg-white shadow-sm border border-gray-100 p-2 md:px-4 text-sm rounded">
                    <span className="font-semibold text-gray-700">Manage Banners</span>
                    <label className="bg-[#2874f0] hover:bg-blue-600 text-white px-3 py-1.5 rounded cursor-pointer flex items-center gap-1 shadow-sm transition">
                        {uploading ? (
                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                        ) : (
                            <Plus className="w-4 h-4" />
                        )}
                        <span className="font-medium text-xs md:text-sm">{uploading ? 'Uploading...' : 'Add Banner'}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleUploadBanner} disabled={uploading} />
                    </label>
                </div>
            )}

            {/* Banner Slider Container */}
            {banners.length > 0 && (
                <div className="overflow-hidden relative w-full rounded shadow-sm aspect-[3/1] md:aspect-[1600/270] bg-gray-100">
                    <div
                        className="flex transition-transform duration-500 ease-in-out h-full"
                        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                        {banners.map((banner, idx) => (
                            <div key={banner._id || idx} className="w-full shrink-0 h-full relative">
                                <a href={banner.link} className="block w-full h-full">
                                    <img src={banner.image} alt={banner.alt} className="w-full h-full object-cover md:object-fill" />
                                </a>
                                {user?.role === 'admin' && (
                                    <button
                                        onClick={() => handleDeleteBanner(banner._id)}
                                        className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-full shadow-lg z-20 transition transform hover:scale-110 active:scale-95"
                                        title="Remove this banner"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {banners.length > 1 && (
                        <>
                            {/* Left/Right Controls */}
                            <button onClick={prevSlide} className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 md:bg-white text-gray-800 p-2 md:p-6 md:py-8 rounded-r-sm shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button onClick={nextSlide} className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 md:bg-white text-gray-800 p-2 md:p-6 md:py-8 rounded-l-sm shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
                                <ChevronRight className="w-6 h-6" />
                            </button>

                            {/* Indicators */}
                            <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                {banners.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentSlide(index)}
                                        className={`h-2 rounded-full transition-all duration-300 ${currentSlide === index ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
                                        aria-label={`Slide ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
