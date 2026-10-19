import { useState, useEffect, useMemo } from 'react';
import BASE_URL from '../api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Checkout() {
    const { cartItems, cartTotal, totalItems, clearCart } = useCart();
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // ─── Detect Buy Now mode ──────────────────────────────────────────────────
    const isBuyNow = searchParams.get('buyNow') === 'true';
    const [buyNowProduct, setBuyNowProduct] = useState(null);

    useEffect(() => {
        if (isBuyNow) {
            const stored = sessionStorage.getItem('buyNowProduct');
            if (stored) {
                setBuyNowProduct(JSON.parse(stored));
            } else {
                // sessionStorage missing — fall back to cart
                navigate('/checkout');
            }
        }
    }, [isBuyNow]);

    // ─── Derive the effective order items ─────────────────────────────────────
    // Buy Now: single product from sessionStorage
    // Cart:    all items from CartContext
    const orderItems = useMemo(() => {
        if (isBuyNow && buyNowProduct) {
            return [{ ...buyNowProduct, quantity: buyNowProduct.quantity || 1 }];
        }
        return cartItems;
    }, [isBuyNow, buyNowProduct, cartItems]);

    const subtotal = useMemo(() =>
        orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        [orderItems]
    );
    const orderItemCount = useMemo(() =>
        orderItems.reduce((sum, item) => sum + item.quantity, 0),
        [orderItems]
    );

    // ─── State ────────────────────────────────────────────────────────────────
    const [shippingAddress, setShippingAddress] = useState({
        fullName: '',
        address: '',
        city: '',
        pincode: '',
        phone: ''
    });

    const [deliveryFee, setDeliveryFee] = useState(800);
    const [paymentMethod, setPaymentMethod] = useState('Online');
    const [loading, setLoading] = useState(false);

    // ─── Auth & guard ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        // For cart checkout, redirect if cart is empty (but not for Buy Now)
        if (!isBuyNow && cartItems.length === 0) {
            navigate('/cart');
        }
        if (user) {
            setShippingAddress(prev => ({ ...prev, fullName: user.name || '' }));
        }
    }, [user, cartItems, isBuyNow, navigate]);

    // ─── Handlers ─────────────────────────────────────────────────────────────
    const handlePincodeChange = (e) => {
        const val = e.target.value;
        setShippingAddress({ ...shippingAddress, pincode: val });
        setDeliveryFee(val === '441202' ? 200 : 800);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingAddress({ ...shippingAddress, [name]: value });
    };

    const finalTotal = subtotal + deliveryFee;

    // ─── Build & submit order ─────────────────────────────────────────────────
    const saveOrderToBackend = async (paymentStatus, paymentResult = null) => {
        const orderPayload = {
            orderItems: orderItems.map(item => ({
                name: item.title || item.name || 'Unknown Item',
                quantity: item.quantity,
                image: (item.images && item.images[0]) ? item.images[0] : (item.image || ''),
                price: item.price,
                product: item._id
            })),
            shippingAddress: {
                address: shippingAddress.address,
                city: shippingAddress.city,
                pincode: shippingAddress.pincode,
                phone: shippingAddress.phone
            },
            paymentMethod: paymentMethod === 'Online' ? 'Razorpay' : 'COD',
            paymentStatus,
            paymentResult,
            itemsPrice: subtotal,
            shippingPrice: deliveryFee,
            totalPrice: finalTotal
        };

        const config = { headers: { Authorization: `Bearer ${token}` } };
        return await axios.post(`${BASE_URL}/api/orders`, orderPayload, config);
    };

    const onOrderSuccess = (orderId) => {
        if (isBuyNow) {
            // ⚠️ Buy Now: clear sessionStorage ONLY — cart stays intact
            sessionStorage.removeItem('buyNowProduct');
        } else {
            // Cart checkout: clear the cart
            clearCart();
        }
        navigate(`/order-success/${orderId}`);
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        const { fullName, address, city, pincode, phone } = shippingAddress;
        if (!fullName || !address || !city || !pincode || !phone) {
            return toast.error('Please fill all shipping details!');
        }

        setLoading(true);

        try {
            if (paymentMethod === 'COD') {
                const res = await saveOrderToBackend('Pending');
                toast.success('Order Placed Successfully!');
                onOrderSuccess(res.data._id);
            } else {
                // Razorpay flow
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const orderRes = await axios.post(
                    `${BASE_URL}/api/payment/create-order`,
                    { amount: finalTotal },
                    config
                );

                const orderData = orderRes.data;

                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_SBl3jr1iGnFDYK',
                    amount: finalTotal * 100,
                    currency: 'INR',
                    name: 'Siddhesh Telecome Services',
                    description: 'Order Payment',
                    order_id: orderData.orderId,
                    handler: async function (response) {
                        try {
                            const verifyRes = await axios.post(
                                `${BASE_URL}/api/payment/verify`,
                                response,
                                config
                            );

                            if (verifyRes.data.verified) {
                                const finalRes = await saveOrderToBackend('Completed', {
                                    id: response.razorpay_payment_id,
                                    status: 'success',
                                    update_time: new Date().toISOString(),
                                    email_address: user?.email
                                });
                                toast.success('Payment successful! Order placed.');
                                onOrderSuccess(finalRes.data._id);
                            } else {
                                toast.error('Payment Verification Failed!');
                            }
                        } catch (error) {
                            console.error('Payment/Save Error:', error.message);
                            toast.error(error.message || 'Error during payment verification');
                        }
                    },
                    prefill: {
                        name: shippingAddress.fullName,
                        email: user?.email,
                        contact: shippingAddress.phone
                    },
                    theme: { color: '#2874f0' }
                };

                const rzp1 = new window.Razorpay(options);
                rzp1.on('payment.failed', () => toast.error('Payment failed!'));
                rzp1.open();
            }
        } catch (error) {
            console.error('Order Error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // ─── Loading state while Buy Now product is being read ───────────────────
    if (isBuyNow && !buyNowProduct) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">

                {/* Left Column — Shipping & Payment */}
                <div className="w-full lg:w-2/3 space-y-6">

                    {/* Buy Now banner */}
                    {isBuyNow && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg px-5 py-3 flex items-center gap-3">
                            <span className="text-orange-500 text-xl">⚡</span>
                            <div>
                                <p className="text-sm font-semibold text-orange-700">Buy Now — Express Checkout</p>
                                <p className="text-xs text-orange-500">Only the selected product will be ordered. Your cart remains unchanged.</p>
                            </div>
                        </div>
                    )}

                    {/* Shipping Address */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-white border-b border-gray-100 px-6 py-4">
                            <h2 className="text-lg font-semibold text-gray-800">1. Shipping Address</h2>
                        </div>
                        <div className="p-6">
                            <form className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={shippingAddress.fullName}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 rounded-md p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={shippingAddress.phone}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 rounded-md p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                            placeholder="10-digit mobile number"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            value={shippingAddress.pincode}
                                            onChange={handlePincodeChange}
                                            className="w-full border border-gray-300 rounded-md p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                            placeholder="e.g. 441202"
                                            required
                                        />
                                        {shippingAddress.pincode === '441202' && (
                                            <p className="text-green-600 text-xs mt-1 font-medium">Local delivery: ₹200 fee applied</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={shippingAddress.city}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 rounded-md p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                            placeholder="City/Town"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address (House No, Building, Street)</label>
                                    <textarea
                                        name="address"
                                        rows="3"
                                        value={shippingAddress.address}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-md p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                        placeholder="Full address"
                                        required
                                    />
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-white border-b border-gray-100 px-6 py-4">
                            <h2 className="text-lg font-semibold text-gray-800">2. Payment Method</h2>
                        </div>
                        <div className="p-6 space-y-3">
                            <label className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'Online' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                                <div className="flex items-center h-5">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="Online"
                                        checked={paymentMethod === 'Online'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <span className="block font-medium text-gray-900">Online Payment (Razorpay)</span>
                                    <span className="block text-gray-500 mt-1">UPI, Credit Card, Debit Card, Netbanking</span>
                                </div>
                            </label>

                            <label className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                                <div className="flex items-center h-5">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="COD"
                                        checked={paymentMethod === 'COD'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <span className="block font-medium text-gray-900">Cash on Delivery</span>
                                    <span className="block text-gray-500 mt-1">Pay when you receive the order</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Right Column — Order Summary */}
                <div className="w-full lg:w-1/3">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 lg:sticky lg:top-8 overflow-hidden">
                        <div className="bg-white border-b border-gray-100 px-6 py-4">
                            <h2 className="text-lg font-semibold text-gray-800">Order Summary</h2>
                        </div>

                        {/* Items Summary */}
                        <div className="p-6 border-b border-gray-100 max-h-60 overflow-y-auto space-y-4">
                            {orderItems.map((item, index) => (
                                <div key={index} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                                            {item.images && item.images[0] ? (
                                                <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xs text-gray-400">Img</span>
                                            )}
                                        </div>
                                        <div className="max-w-[120px]">
                                            <p className="text-gray-900 truncate font-medium">{item.title}</p>
                                            <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <span className="font-medium text-gray-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                </div>
                            ))}
                        </div>

                        {/* Price Details */}
                        <div className="p-6 space-y-4 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal ({orderItemCount} item{orderItemCount > 1 ? 's' : ''})</span>
                                <span>₹{subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Delivery Fee</span>
                                <span className={shippingAddress.pincode === '441202' ? 'text-green-600 font-medium' : ''}>
                                    ₹{deliveryFee}
                                </span>
                            </div>

                            <div className="border-t border-gray-100 pt-4 mt-2">
                                <div className="flex justify-between font-bold text-lg text-gray-900">
                                    <span>Total Amount</span>
                                    <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="p-6 pt-0">
                            <button
                                onClick={handlePlaceOrder}
                                disabled={loading}
                                className="w-full focus:outline-none flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    paymentMethod === 'Online'
                                        ? `Pay with Razorpay (₹${finalTotal.toLocaleString('en-IN')})`
                                        : `Place COD Order (₹${finalTotal.toLocaleString('en-IN')})`
                                )}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
