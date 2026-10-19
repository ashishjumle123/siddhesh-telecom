import { useEffect, useState } from 'react';
import BASE_URL from '../api';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, MapPin, CreditCard, Box, Download, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function OrderSuccess() {
    const { orderId } = useParams();
    const { token } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orderId || !token) return;
        axios.get(`${BASE_URL}/api/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            setOrder(res.data);
        }).catch(err => {
            console.error('Order fetch error', err);
        }).finally(() => setLoading(false));
    }, [orderId, token]);

    const downloadInvoice = () => {
        if (!order) return;
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });

        const pageW = doc.internal.pageSize.getWidth();
        let y = 12;

        // ——— HEADER ———
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 80, 200);
        doc.text('Siddhesh Telecome Services', pageW / 2, y, { align: 'center' });

        y += 7;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        doc.text('Lavthalswar, Oppo. Anandi Hospital, Jejuri, Tal-Purandhar, Dist-Pune', pageW / 2, y, { align: 'center' });
        y += 5;
        doc.text('Ph: 9822521992 / 9923777771', pageW / 2, y, { align: 'center' });
        y += 5;
        doc.text('GST No: 27XXXXX1234Z5', pageW / 2, y, { align: 'center' });

        y += 4;
        doc.setDrawColor(30, 80, 200);
        doc.setLineWidth(0.5);
        doc.line(14, y, pageW - 14, y);
        y += 1;
        doc.line(14, y + 1, pageW - 14, y + 1);

        y += 6;
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);
        doc.text('TAX INVOICE', pageW / 2, y, { align: 'center' });

        // ——— ORDER DETAILS (two columns) ———
        y += 8;
        const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
        const customerName = order.userDetails?.name || order.user?.name || 'Customer';
        const phone = order.userDetails?.phone || order.shippingAddress?.phone || '';
        const addr = order.shippingAddress;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Bill No:', 14, y);
        doc.setFont('helvetica', 'normal');
        doc.text(order.orderId || order._id?.slice(-8).toUpperCase() || '—', 35, y);

        doc.setFont('helvetica', 'bold');
        doc.text('Date:', 120, y);
        doc.setFont('helvetica', 'normal');
        doc.text(orderDate, 132, y);

        y += 5;
        doc.setFont('helvetica', 'bold');
        doc.text('Customer:', 14, y);
        doc.setFont('helvetica', 'normal');
        doc.text(customerName, 35, y);

        doc.setFont('helvetica', 'bold');
        doc.text('Payment:', 120, y);
        doc.setFont('helvetica', 'normal');
        doc.text(order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod, 138, y);

        y += 5;
        doc.setFont('helvetica', 'bold');
        doc.text('Phone:', 14, y);
        doc.setFont('helvetica', 'normal');
        doc.text(phone, 30, y);

        doc.setFont('helvetica', 'bold');
        doc.text('Status:', 120, y);
        doc.setFont('helvetica', 'normal');
        doc.text(order.paymentStatus || 'Pending', 134, y);

        y += 5;
        doc.setFont('helvetica', 'bold');
        doc.text('Address:', 14, y);
        doc.setFont('helvetica', 'normal');
        const fullAddr = `${addr?.address || ''}, ${addr?.city || ''} - ${addr?.pincode || ''}`;
        doc.text(fullAddr, 32, y);

        y += 3;
        doc.setDrawColor(180);
        doc.setLineWidth(0.3);
        doc.line(14, y, pageW - 14, y);

        // ——— PRODUCTS TABLE ———
        y += 4;
        const rows = (order.orderItems || []).map((item, i) => [
            i + 1,
            item.name,
            item.quantity,
            `Rs. ${item.price.toLocaleString('en-IN')}`,
            `Rs. ${(item.price * item.quantity).toLocaleString('en-IN')}`
        ]);

        autoTable(doc, {
            startY: y,
            head: [['Sr.', 'Product Name', 'Qty', 'Rate', 'Amount']],
            body: rows,
            theme: 'grid',
            headStyles: {
                fillColor: [30, 80, 200],
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 9,
                halign: 'center'
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 12 },
                1: { cellWidth: 80 },
                2: { halign: 'center', cellWidth: 15 },
                3: { halign: 'right', cellWidth: 35 },
                4: { halign: 'right', cellWidth: 35 }
            },
            bodyStyles: { fontSize: 9 },
            alternateRowStyles: { fillColor: [245, 248, 255] },
        });

        // ——— TOTALS SECTION ———
        const finalY = doc.lastAutoTable.finalY + 5;
        const rightX = pageW - 14;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Gross Amount:', rightX - 60, finalY, { align: 'left' });
        doc.text(`Rs. ${order.itemsPrice?.toLocaleString('en-IN') || 0}`, rightX, finalY, { align: 'right' });

        const cgst = Math.round((order.itemsPrice || 0) * 0.09);
        const sgst = cgst;

        doc.text('Add CGST (9%):', rightX - 60, finalY + 5, { align: 'left' });
        doc.text(`Rs. ${cgst.toLocaleString('en-IN')}`, rightX, finalY + 5, { align: 'right' });

        doc.text('Add SGST (9%):', rightX - 60, finalY + 10, { align: 'left' });
        doc.text(`Rs. ${sgst.toLocaleString('en-IN')}`, rightX, finalY + 10, { align: 'right' });

        doc.text('Shipping:', rightX - 60, finalY + 15, { align: 'left' });
        doc.text(`Rs. ${order.shippingPrice?.toLocaleString('en-IN') || 0}`, rightX, finalY + 15, { align: 'right' });

        doc.setLineWidth(0.4);
        doc.line(rightX - 65, finalY + 17, rightX, finalY + 17);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Invoice Total:', rightX - 60, finalY + 23, { align: 'left' });
        doc.setTextColor(30, 80, 200);
        doc.text(`Rs. ${order.totalPrice?.toLocaleString('en-IN') || 0}`, rightX, finalY + 23, { align: 'right' });

        // ——— FOOTER ———
        const footerY = finalY + 38;
        doc.setDrawColor(30, 80, 200);
        doc.setLineWidth(0.4);
        doc.line(14, footerY, pageW - 14, footerY);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        doc.text('Customer Signature', 20, footerY + 12);
        doc.line(14, footerY + 14, 65, footerY + 14);

        doc.setFont('helvetica', 'bold');
        doc.text('For: Siddhesh Telecome Services', rightX, footerY + 12, { align: 'right' });
        doc.line(rightX - 55, footerY + 14, rightX, footerY + 14);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(120);
        doc.text('Thank you for shopping with us!', pageW / 2, footerY + 20, { align: 'center' });

        doc.save(`Invoice_${order.orderId || order._id}.pdf`);
    };

    if (loading) return (
        <div className="min-h-screen flex justify-center items-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
    );

    if (!order) return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 text-center px-4">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Order Placed!</h2>
            <p className="text-gray-600 mb-6">Your order has been placed successfully.</p>
            <Link to="/" className="bg-[#fb641b] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#e05615]">Continue Shopping</Link>
        </div>
    );

    // Estimated delivery: 5-7 days
    const estDelivery = new Date(new Date(order.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000);

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto space-y-4">

                {/* Success Banner */}
                <div className="bg-green-500 rounded-xl text-white p-6 text-center shadow-md">
                    <CheckCircle className="w-16 h-16 mx-auto mb-3" />
                    <h1 className="text-2xl font-bold">Order Successfully Placed!</h1>
                    <p className="opacity-90 mt-2 text-sm">
                        Thank you for shopping at Siddhesh Telecome Services. Your order is confirmed.
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Order ID + Date */}
                    <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-semibold">Order ID</p>
                            <p className="text-base font-bold text-gray-900 mt-0.5">{order.orderId || order._id}</p>
                        </div>
                        <div className="text-left sm:text-right">
                            <p className="text-xs text-gray-400 uppercase font-semibold">Order Date</p>
                            <p className="font-semibold text-gray-700 mt-0.5">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    <div className="p-6 space-y-5">
                        {/* Address + Payment */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-[#fb641b] mt-0.5 flex-shrink-0" />
                                <div className="text-sm">
                                    <h3 className="font-bold text-gray-900 mb-1">Delivery Address</h3>
                                    <p className="text-gray-700 font-medium">{order.userDetails?.name || order.user?.name}</p>
                                    <p className="text-gray-600">{order.shippingAddress?.address}</p>
                                    <p className="text-gray-600">{order.shippingAddress?.city} - {order.shippingAddress?.pincode}</p>
                                    <p className="text-gray-600 mt-1">Ph: {order.userDetails?.phone || order.shippingAddress?.phone}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <CreditCard className="w-5 h-5 text-[#2874f0] mt-0.5 flex-shrink-0" />
                                <div className="text-sm">
                                    <h3 className="font-bold text-gray-900 mb-1">Payment</h3>
                                    <p className="text-gray-700">Method: <span className="font-semibold">{order.paymentMethod}</span></p>
                                    <p className={`mt-1 font-bold ${order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-orange-500'}`}>
                                        {order.paymentStatus}
                                    </p>
                                    <p className="text-gray-500 mt-2 text-xs">
                                        Est. Delivery: {estDelivery.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="border border-gray-100 rounded-lg overflow-hidden">
                            {(order.orderItems || []).map((item, i) => (
                                <div key={i} className={`flex items-center gap-4 p-3 ${i > 0 ? 'border-t border-gray-100' : ''}`}>
                                    <img src={item.image} alt={item.name} className="w-12 h-12 object-contain rounded border border-gray-100 bg-white p-1 flex-shrink-0" />
                                    <p className="flex-1 text-sm font-medium text-gray-800 truncate">{item.name}</p>
                                    <div className="text-right text-sm flex-shrink-0">
                                        <p className="font-bold">₹{item.price.toLocaleString('en-IN')}</p>
                                        <p className="text-gray-400 text-xs">× {item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div className="bg-gray-50 rounded-lg px-4 py-3 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-gray-700 font-bold">
                                <Box className="w-4 h-4" /> Total Amount
                            </div>
                            <span className="text-xl font-bold text-gray-900">₹{order.totalPrice?.toLocaleString('en-IN')}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                                onClick={downloadInvoice}
                                className="flex-1 flex items-center justify-center gap-2 bg-[#2874f0] hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-colors shadow"
                            >
                                <Download className="w-4 h-4" /> Download Invoice
                            </button>
                            <Link
                                to="/my-orders"
                                className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors"
                            >
                                <ShoppingBag className="w-4 h-4" /> View My Orders
                            </Link>
                            <Link
                                to="/"
                                className="flex-1 flex items-center justify-center gap-2 bg-[#fb641b] hover:bg-[#e05615] text-white py-3 rounded-lg font-bold transition-colors"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
