import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import BASE_URL from '../api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const { user, token } = useAuth();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const authHeaders = () => ({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    });

    // ─── Fetch from DB ────────────────────────────────────────────────────────

    const fetchWishlist = useCallback(async () => {
        // Fix: check both user AND token (previous code checked user.token which is undefined)
        if (!user || !token) {
            setWishlistItems([]);
            return;
        }
        try {
            setLoading(true);
            const res = await fetch(`${BASE_URL}/api/users/wishlist`, {
                headers: authHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setWishlistItems(data);
                } else {
                    setWishlistItems([]);
                }
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    }, [user, token]);

    // ─── Re-fetch on auth changes ─────────────────────────────────────────────

    useEffect(() => {
        if (user && token) {
            fetchWishlist();
        } else {
            setWishlistItems([]);
        }
    }, [user, token]);

    // ─── Toggle wishlist ──────────────────────────────────────────────────────

    const toggleWishlist = async (product) => {
        if (!user || !token) {
            toast.error('Please login to add to wishlist');
            return;
        }

        const isSaved = wishlistItems.some(item => item._id === product._id);

        // Optimistic UI update
        if (isSaved) {
            setWishlistItems(prev => prev.filter(item => item._id !== product._id));
            toast('Removed from wishlist', { icon: '💔' });
        } else {
            setWishlistItems(prev => [...prev, product]);
            toast.success('Added to wishlist ❤️');
        }

        try {
            const res = await fetch(`${BASE_URL}/api/users/wishlist`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ productId: product._id })
            });

            if (!res.ok) {
                // Rollback on failure
                await fetchWishlist();
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            await fetchWishlist();
        }
    };

    const isWishlisted = (productId) =>
        wishlistItems.some(item => item._id === productId);

    return (
        <WishlistContext.Provider value={{
            wishlistItems,
            toggleWishlist,
            isWishlisted,
            loading,
            fetchWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    );
};
