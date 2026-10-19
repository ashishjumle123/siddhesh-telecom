import { useState } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { Star, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product }) {
    const { wishlistItems, toggleWishlist } = useWishlist();
    const navigate = useNavigate();
    const [imageLoaded, setImageLoaded] = useState(false);

    const isLoved = wishlistItems.some(item => item._id === product._id);

    return (
        <div
            onClick={() => navigate(`/product/${product._id}`)}
            className="flex flex-col items-center group cursor-pointer w-full h-full"
        >
            {/* Image Container - Styled exactly like the reference categories */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                {!imageLoaded && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                )}
                <img
                    src={product.images?.[0] || 'https://via.placeholder.com/300'}
                    alt={product.title}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setImageLoaded(true)}
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300?text=Image+Not+Available';
                        setImageLoaded(true);
                    }}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                />

                {/* Wishlist Button - preserved functionality, modernized aesthetics */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        toggleWishlist(product);
                    }}
                    className="absolute top-2.5 right-2.5 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow hover:bg-white transition-all z-10"
                >
                    <Heart className={`w-4 h-4 transition-colors ${isLoved ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
                </button>
            </div>

            {/* Product Details - Clean, centered text below image */}
            <div className="mt-3 text-center px-1 flex flex-col flex-grow w-full">
                <h3 className="text-sm md:text-[15px] font-[500] text-gray-800 line-clamp-2 leading-relaxed group-hover:text-blue-600 transition-colors">
                    {product.title}
                </h3>

                <div className="mt-auto pt-2 flex items-center justify-center gap-2">
                    <span className="text-base md:text-lg font-bold text-gray-900">
                        ₹{product.price?.toLocaleString('en-IN')}
                    </span>

                    {/* Simplified Rating */}
                    {product.ratingsAverage > 0 && (
                        <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded text-[11px] font-bold text-yellow-700">
                            {product.ratingsAverage} <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        </div>
                    )}
                </div>

                {/* WhatsApp Direct Enquiry */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        const phone = '919923777771';
                        const productUrl = `${window.location.origin}/product/${product._id}`;
                        const message = `Hello Siddhesh Telecom Services, I am interested in: *${product.title}* (₹${product.price?.toLocaleString('en-IN')}). Link: ${productUrl}`;
                        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
                    }}
                    className="mt-2.5 w-full py-1.5 px-3 bg-emerald-50 hover:bg-[#25D366] text-emerald-700 hover:text-white border border-emerald-200 hover:border-[#25D366] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 shadow-2xs"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 3.825 0 6.938 3.112 6.938 6.937 0 3.825-3.113 6.938-6.938 6.938z" />
                    </svg>
                    <span>Enquire on WhatsApp</span>
                </button>
            </div>
        </div>
    );
}
