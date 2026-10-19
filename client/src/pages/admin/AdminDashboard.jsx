import { useState, useEffect } from 'react';
import BASE_URL from '../../api';
import { LayoutDashboard, Package, ShoppingBag, Menu, X, TrendingUp, IndianRupee, Clock, CheckCircle, AlertCircle, Layers } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ManageProducts from './ManageProducts';
import ManageOrders from './ManageOrders';
import ManageCategories from './ManageCategories';
import AdminOrderDetail from './AdminOrderDetail';

function OverviewDashboard({ onViewOrder }) {
    const { token } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`${BASE_URL}/api/orders`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) {
                    const orders = data;
                    const totalRevenue = orders
                        .filter(o => o.orderStatus !== 'Cancelled')
                        .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
                    const pending = orders.filter(o => ['Placed', 'Confirmed', 'Packed'].includes(o.orderStatus)).length;
                    const shipped = orders.filter(o => ['Shipped', 'Out for Delivery'].includes(o.orderStatus)).length;
                    const delivered = orders.filter(o => o.orderStatus === 'Delivered').length;
                    const cancelled = orders.filter(o => o.orderStatus === 'Cancelled').length;

                    // Last 7 orders
                    const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 7);

                    setStats({ total: orders.length, totalRevenue, pending, shipped, delivered, cancelled, recentOrders });
                }
            } catch (err) {
                console.error('Stats error:', err);
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchStats();
    }, [token]);

    if (loading) return (
        <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2874f0]"></div>
        </div>
    );

    if (!stats) return <p className="text-gray-500 text-center py-12">Could not load analytics. Please try again.</p>;

    const cards = [
        { label: 'Total Orders', value: stats.total, icon: ShoppingBag, color: 'border-blue-500', bg: 'bg-blue-50', iconColor: 'text-blue-500' },
        { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'border-green-500', bg: 'bg-green-50', iconColor: 'text-green-500' },
        { label: 'Pending / Active', value: stats.pending + stats.shipped, icon: Clock, color: 'border-orange-500', bg: 'bg-orange-50', iconColor: 'text-orange-500' },
        { label: 'Delivered', value: stats.delivered, icon: CheckCircle, color: 'border-emerald-500', bg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
        { label: 'In Transit', value: stats.shipped, icon: TrendingUp, color: 'border-purple-500', bg: 'bg-purple-50', iconColor: 'text-purple-500' },
        { label: 'Cancelled', value: stats.cancelled, icon: AlertCircle, color: 'border-red-500', bg: 'bg-red-50', iconColor: 'text-red-500' },
    ];

    const STATUS_COLORS = {
        Placed: 'bg-blue-100 text-blue-700',
        Confirmed: 'bg-indigo-100 text-indigo-700',
        Packed: 'bg-yellow-100 text-yellow-700',
        Shipped: 'bg-purple-100 text-purple-700',
        'Out for Delivery': 'bg-orange-100 text-orange-700',
        Delivered: 'bg-green-100 text-green-700',
        Cancelled: 'bg-red-100 text-red-700',
    };

    return (
        <div className="space-y-8">
            {/* Analytics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((c, i) => {
                    const Icon = c.icon;
                    return (
                        <div key={i} className={`bg-white rounded-xl shadow-sm border-l-4 ${c.color} p-4 sm:p-5 flex items-center gap-4 min-w-0`}>
                            <div className={`w-12 h-12 rounded-full ${c.bg} flex items-center justify-center flex-shrink-0`}>
                                <Icon className={`w-6 h-6 ${c.iconColor}`} />
                            </div>
                            <div className="overflow-hidden w-full">
                                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide truncate">{c.label}</p>
                                <p className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mt-0.5 truncate">{c.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-bold text-gray-800">Recent Orders</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Last 7 orders placed</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                            <tr>
                                {['Order ID', 'Customer', 'Amount', 'Payment', 'Status', 'Action'].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {stats.recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">No orders yet.</td>
                                </tr>
                            ) : stats.recentOrders.map(order => (
                                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3 text-xs font-mono text-[#2874f0] font-bold">
                                        {order.orderId || `...${order._id?.slice(-6)}`}
                                    </td>
                                    <td className="px-5 py-3 text-sm font-medium text-gray-800 max-w-[140px] truncate">
                                        {order.userDetails?.name || order.user?.name || 'Unknown'}
                                    </td>
                                    <td className="px-5 py-3 text-sm font-bold text-gray-900">
                                        ₹{order.totalPrice?.toLocaleString('en-IN')}
                                    </td>
                                    <td className="px-5 py-3 text-xs text-gray-600">
                                        {order.paymentMethod}<br />
                                        <span className={`font-bold ${order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-orange-500'}`}>{order.paymentStatus}</span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-700'}`}>
                                            {order.orderStatus}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <button
                                            onClick={() => onViewOrder(order._id)}
                                            className="text-[#2874f0] hover:underline text-xs font-semibold"
                                        >
                                            View →
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('products');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [viewingOrderId, setViewingOrderId] = useState(null);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleViewOrder = (orderId) => {
        setViewingOrderId(orderId);
        setActiveTab('order-detail');
        setIsSidebarOpen(false);
    };

    const handleBackFromDetail = () => {
        setViewingOrderId(null);
        setActiveTab('orders');
    };

    const navItems = [
        { id: 'products', label: 'Manage Products', icon: Package },
        { id: 'categories', label: 'Manage Categories', icon: Layers },
        { id: 'overview', label: 'Store Overview', icon: LayoutDashboard },
        { id: 'orders', label: 'Customer Orders', icon: ShoppingBag },
    ];

    const tabTitle = activeTab === 'order-detail' ? 'Order Details'
        : navItems.find(n => n.id === activeTab)?.label || activeTab;

    const renderContent = () => {
        switch (activeTab) {
            case 'categories': return <ManageCategories />;
            case 'orders': return <ManageOrders onViewOrder={handleViewOrder} />;
            case 'order-detail': return <AdminOrderDetail orderId={viewingOrderId} onBack={handleBackFromDetail} />;
            case 'overview': return <OverviewDashboard onViewOrder={handleViewOrder} />;
            case 'products':
            default: return <ManageProducts />;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100 font-sans">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={toggleSidebar} />
            )}

            {/* Sidebar */}
            <aside className={`fixed md:sticky top-0 left-0 z-30 w-64 h-screen bg-white shadow-xl transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
                <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-[#2874f0] to-[#1458c8]">
                    <div>
                        <h2 className="text-lg font-bold text-white">Admin Panel</h2>
                        <p className="text-xs text-blue-200 mt-0.5">Siddhesh Telecom Digital</p>
                    </div>
                    <button className="md:hidden text-white/80 hover:text-white" onClick={toggleSidebar}>
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id || (item.id === 'orders' && activeTab === 'order-detail');
                        return (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id); setViewingOrderId(null); setIsSidebarOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-left text-sm ${isActive ? 'bg-[#2874f0] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400 text-center">Siddhesh Telecom Digital</p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Topbar */}
                <div className="md:hidden bg-white shadow-sm p-4 flex items-center gap-4 sticky top-0 z-10 border-b border-gray-100">
                    <button onClick={toggleSidebar} className="text-gray-600">
                        <Menu className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-800 capitalize">{tabTitle}</h1>
                </div>

                <div className="p-4 md:p-8 flex-1 overflow-auto">
                    <div className="hidden md:block mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">{tabTitle}</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {activeTab === 'overview' ? 'Live overview of your store performance'
                                : activeTab === 'orders' ? 'View and manage all customer orders'
                                    : activeTab === 'order-detail' ? `Detailed view of order #${viewingOrderId?.slice(-8)}`
                                        : activeTab === 'categories' ? 'Manage product categories dynamically'
                                            : 'Manage your product catalog'}
                        </p>
                    </div>
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}
