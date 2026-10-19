import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import BASE_URL from '../api';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { user, token } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [cartLoading, setCartLoading] = useState(false);

    // ─── Helpers ──────────────────────────────────────────────────────────────

    const authHeaders = () => ({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    });

    // Read guest cart from localStorage
    const getGuestCart = () => {
        try {
            return JSON.parse(localStorage.getItem('guestCart') || '[]');
        } catch {
            return [];
        }
    };

    // Write guest cart to localStorage
    const saveGuestCart = (items) => {
        localStorage.setItem('guestCart', JSON.stringify(items));
    };

    // ─── Fetch DB cart ─────────────────────────────────────────────────────────

    const fetchCart = useCallback(async () => {
        if (!user || !token) return;
        try {
            setCartLoading(true);
            const res = await fetch(`${BASE_URL}/api/cart`, {
                headers: authHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    const normalized = data.map(item => ({
                        ...(item.product || {}),
                        quantity: item.quantity
                    }));
                    setCartItems(normalized);
                } else {
                    setCartItems([]);
                }
            }
        } catch (err) {
            console.error('Failed to fetch cart:', err);
        } finally {
            setCartLoading(false);
        }
    }, [user, token]);

    // ─── Merge guest cart into DB on login ────────────────────────────────────

    const mergeGuestCart = useCallback(async () => {
        const guestCart = getGuestCart();
        if (!guestCart.length) {
            await fetchCart();
            return;
        }
        try {
            const res = await fetch(`${BASE_URL}/api/cart/merge`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ guestCart })
            });
            if (res.ok) {
                const data = await res.json();
                const normalized = data.map(item => ({
                    ...item.product,
                    quantity: item.quantity
                }));
                setCartItems(normalized);
                // Clear guest cart after successful merge
                localStorage.removeItem('guestCart');
            }
        } catch (err) {
            console.error('Failed to merge guest cart:', err);
            await fetchCart();
        }
    }, [user, token]);

    // ─── Sync on auth changes ──────────────────────────────────────────────────

    useEffect(() => {
        if (user && token) {
            // Logged in: merge any guest cart then load from DB
            mergeGuestCart();
        } else {
            // Logged out: load from localStorage guest cart
            setCartItems(getGuestCart());
        }
    }, [user, token]);

    const addToCart = async (product) => {
        if (!user || !token) {
            toast.error('Please login to add items to your cart');
            // Hard redirect from context to force UI shift
            window.location.href = '/login?redirect=/cart';
            return;
        }

        // ── Logged in: optimistic UI then sync to DB
        setCartItems(prev => {
            const existing = prev.find(i => i._id === product._id);
            if (existing) {
                return prev.map(i =>
                    i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });

        try {
            const res = await fetch(`${BASE_URL}/api/cart/add`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ productId: product._id, quantity: 1 })
            });
            if (res.ok) {
                const data = await res.json();
                const normalized = data.map(item => ({
                    ...item.product,
                    quantity: item.quantity
                }));
                setCartItems(normalized);
                toast.success(`${product.title} added to cart`);
            } else {
                // Rollback on failure
                await fetchCart();
                toast.error('Failed to add to cart');
            }
        } catch (err) {
            await fetchCart();
            toast.error('Failed to add to cart');
        }
    };

    // ─── REMOVE FROM CART ─────────────────────────────────────────────────────

    const removeFromCart = async (id) => {
        if (user && token) {
            setCartItems(prev => prev.filter(i => i._id !== id));
            try {
                await fetch(`${BASE_URL}/api/cart/remove/${id}`, {
                    method: 'DELETE',
                    headers: authHeaders()
                });
            } catch {
                await fetchCart();
            }
        } else {
            setCartItems(prev => {
                const updated = prev.filter(i => i._id !== id);
                saveGuestCart(updated);
                return updated;
            });
        }
        toast('Item removed from cart', { icon: '🗑️' });
    };

    // ─── UPDATE QUANTITY ──────────────────────────────────────────────────────

    const updateQuantity = async (id, newQuantity) => {
        if (newQuantity < 1) return;

        if (user && token) {
            setCartItems(prev =>
                prev.map(i => i._id === id ? { ...i, quantity: newQuantity } : i)
            );
            try {
                await fetch(`${BASE_URL}/api/cart/update`, {
                    method: 'PUT',
                    headers: authHeaders(),
                    body: JSON.stringify({ productId: id, quantity: newQuantity })
                });
            } catch {
                await fetchCart();
            }
        } else {
            setCartItems(prev => {
                const updated = prev.map(i =>
                    i._id === id ? { ...i, quantity: newQuantity } : i
                );
                saveGuestCart(updated);
                return updated;
            });
        }
    };

    // ─── CLEAR CART ───────────────────────────────────────────────────────────

    const clearCart = async () => {
        setCartItems([]);
        if (user && token) {
            try {
                await fetch(`${BASE_URL}/api/cart/clear`, {
                    method: 'DELETE',
                    headers: authHeaders()
                });
            } catch (err) {
                console.error('Failed to clear cart in DB:', err);
            }
        } else {
            localStorage.removeItem('guestCart');
        }
        toast.success('Cart cleared');
    };

    // ─── Derived values ───────────────────────────────────────────────────────

    const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            cartLoading,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartTotal,
            totalItems,
            fetchCart
        }}>
            {children}
        </CartContext.Provider>
    );
};
