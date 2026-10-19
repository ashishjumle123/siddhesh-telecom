import { useState, useEffect } from 'react';
import BASE_URL from '../api';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import HeroBanner from '../components/HeroBanner';
import Footer from '../components/Footer';

export default function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search');

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let queryURL = `${BASE_URL}/api/products`;
                const queryArray = [];

                if (searchQuery) queryArray.push(`keyword=${encodeURIComponent(searchQuery)}`);

                if (queryArray.length > 0) {
                    queryURL += `?${queryArray.join('&')}`;
                }

                const res = await axios.get(queryURL);
                if (res.data) {
                    if (Array.isArray(res.data.products)) {
                        setProducts(res.data.products);
                    } else if (Array.isArray(res.data)) {
                        setProducts(res.data);
                    } else {
                        setProducts([]);
                    }
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [searchQuery]);

    return (
        <div className="w-full bg-[#f1f3f6] min-h-screen flex flex-col">

            {/* Show HeroBanner only when NOT searching */}
            {!searchQuery && <HeroBanner />}

            {/* Main Content Area */}
            <div className="max-w-[1400px] mx-auto p-2 md:p-4 pb-8 flex-grow w-full">

                {/* Product Section Box */}
                <div className="bg-white rounded shadow-sm border border-gray-100 min-h-[50vh]">

                    {/* Header */}
                    <div className="border-b border-gray-200 p-4 flex justify-between items-center">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                            {searchQuery ? `Search Results: "${searchQuery}"` : 'Best Deals on Electronics & Furniture'}
                            <span className="text-xs md:text-sm font-medium text-gray-500 ml-2">
                                ({products.length} items)
                            </span>
                        </h2>
                    </div>

                    {/* Product Grid */}
                    {loading ? (
                        <div className="flex justify-center items-center py-24">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2874f0]"></div>
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10 p-4 md:p-6">
                            {products.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 text-gray-500 mt-10">
                            <img src="https://rukminim1.flixcart.com/www/800/800/promos/16/05/2019/d438a32e-765a-4d8b-b4a6-520b560971e8.png?q=90" alt="No Results" className="w-48 mb-6 opacity-75" />
                            <h3 className="text-xl font-medium text-gray-800">Sorry, no matching results found!</h3>
                            <p className="text-sm mt-2 text-gray-500">Try adjusting your search for something else.</p>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}
