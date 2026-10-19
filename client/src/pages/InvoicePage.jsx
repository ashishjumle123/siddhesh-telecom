import { useState, useEffect, useRef } from 'react';
import BASE_URL from '../api';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Download, Printer, FileText, AlertCircle } from 'lucide-react';

// ─── helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) =>
    Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

// ─── component ────────────────────────────────────────────────────────────────
export default function InvoicePage() {
    const { orderId } = useParams();
    const { token, user } = useAuth();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloading, setDownloading] = useState(false);
    const invoiceRef = useRef(null);

    // ── fetch order ──────────────────────────────────────────────────────────
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await fetch(`${BASE_URL}/api/orders/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (res.ok) {
                    setOrder(data);
                } else {
                    setError(data.message || 'Order not found');
                }
            } catch {
                setError('Network error. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (token && orderId) fetchOrder();
    }, [orderId, token]);

    // ── GST calculation ──────────────────────────────────────────────────────
    const grossAmount = order?.itemsPrice || 0;
    const deliveryFee = order?.shippingPrice || 0;
    const cgst = Math.round(grossAmount * 0.09);
    const sgst = Math.round(grossAmount * 0.09);
    const grandTotal = grossAmount + deliveryFee + cgst + sgst;

    // ── download / print ─────────────────────────────────────────────────────
    const handleDownload = async () => {
        setDownloading(true);
        try {
            const html2pdf = (await import('html2pdf.js')).default;
            const element = invoiceRef.current;
            const opt = {
                margin: [8, 8, 8, 8],
                filename: `Invoice_${order.orderId || order._id}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, letterRendering: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            };
            await html2pdf().set(opt).from(element).save();
        } catch (err) {
            // Fallback: use jspdf if html2pdf not available
            try {
                const { default: jsPDF } = await import('jspdf');
                const { default: autoTable } = await import('jspdf-autotable');
                generateJsPDFFallback(jsPDF, autoTable);
            } catch {
                window.print();
            }
        } finally {
            setDownloading(false);
        }
    };

    const generateJsPDFFallback = (jsPDF, autoTable) => {
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });
        const pageW = doc.internal.pageSize.getWidth();
        let y = 12;

        // ── Header ────────────────────────────────────────────────────────────
        doc.setFontSize(20); doc.setFont('helvetica', 'bold'); doc.setTextColor(180, 60, 0);
        doc.text('Siddhesh Telecome Services', pageW / 2, y, { align: 'center' });

        y += 7; doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(60, 60, 60);
        doc.text('Cash Memo / Tax Invoice', pageW / 2, y, { align: 'center' });

        y += 5; doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(80, 80, 80);
        doc.text('GST No: 27AUCPV6162E1ZG', pageW / 2, y, { align: 'center' });

        y += 5; doc.text('Lavthalswar, Oppo. Anandi Hospital, Jejuri, Tal-Purandhar, Dist-Pune', pageW / 2, y, { align: 'center' });
        y += 4; doc.text('Ph: 9822521992 / 9923777771', pageW / 2, y, { align: 'center' });
        y += 4; doc.text('Owner: Mahesh Mhetre', pageW / 2, y, { align: 'center' });

        y += 3; doc.setDrawColor(180, 60, 0); doc.setLineWidth(0.6); doc.line(14, y, pageW - 14, y);

        // ── Meta ─────────────────────────────────────────────────────────────
        y += 7;
        const odate = fmtDate(order.createdAt);
        const cname = order.userDetails?.name || 'Customer';
        const phone = order.userDetails?.phone || order.shippingAddress?.phone || '';
        const addr = order.shippingAddress;

        doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(0);
        doc.text('Bill No:', 14, y);
        doc.setFont('helvetica', 'normal'); doc.text(order.orderId || order._id?.slice(-8).toUpperCase(), 32, y);
        doc.setFont('helvetica', 'bold'); doc.text('Date:', pageW - 60, y);
        doc.setFont('helvetica', 'normal'); doc.text(odate, pageW - 48, y);

        y += 5; doc.setFont('helvetica', 'bold'); doc.text('Customer:', 14, y);
        doc.setFont('helvetica', 'normal'); doc.text(cname, 32, y);
        doc.setFont('helvetica', 'bold'); doc.text('Phone:', pageW - 60, y);
        doc.setFont('helvetica', 'normal'); doc.text(phone, pageW - 48, y);

        y += 5; doc.setFont('helvetica', 'bold'); doc.text('Address:', 14, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`${addr?.address || ''}, ${addr?.city || ''} - ${addr?.pincode || ''}`, 32, y);

        y += 3; doc.setDrawColor(200); doc.setLineWidth(0.3); doc.line(14, y, pageW - 14, y);

        // ── Products table ────────────────────────────────────────────────────
        autoTable(doc, {
            startY: y + 3,
            head: [['Sr.', 'Particulars', 'Qty', 'Rate', 'Amount']],
            body: (order.orderItems || []).map((item, i) => [
                i + 1,
                item.name,
                item.quantity,
                `Rs. ${fmt(item.price)}`,
                `Rs. ${fmt(item.price * item.quantity)}`,
            ]),
            theme: 'grid',
            headStyles: { fillColor: [180, 60, 0], textColor: 255, fontStyle: 'bold', fontSize: 9, halign: 'center' },
            columnStyles: {
                0: { halign: 'center', cellWidth: 12 },
                1: { cellWidth: 78 },
                2: { halign: 'center', cellWidth: 16 },
                3: { halign: 'right', cellWidth: 35 },
                4: { halign: 'right', cellWidth: 35 },
            },
            bodyStyles: { fontSize: 9 },
            alternateRowStyles: { fillColor: [255, 248, 245] },
        });

        // ── Price summary ─────────────────────────────────────────────────────
        const fY = doc.lastAutoTable.finalY + 5;
        const rX = pageW - 14;
        doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(0);
        doc.text('Gross Amount:', rX - 58, fY); doc.text(`Rs. ${fmt(grossAmount)}`, rX, fY, { align: 'right' });
        doc.text('Delivery Fee:', rX - 58, fY + 5); doc.text(`Rs. ${fmt(deliveryFee)}`, rX, fY + 5, { align: 'right' });
        doc.text('ADD CGST (9%):', rX - 58, fY + 10); doc.text(`Rs. ${fmt(cgst)}`, rX, fY + 10, { align: 'right' });
        doc.text('ADD SGST (9%):', rX - 58, fY + 15); doc.text(`Rs. ${fmt(sgst)}`, rX, fY + 15, { align: 'right' });
        doc.setLineWidth(0.4); doc.line(rX - 63, fY + 17, rX, fY + 17);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(180, 60, 0);
        doc.text('Invoice Value:', rX - 58, fY + 23); doc.text(`Rs. ${fmt(grandTotal)}`, rX, fY + 23, { align: 'right' });

        // ── Terms ─────────────────────────────────────────────────────────────
        const tY = fY + 35;
        doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(0);
        doc.text('Terms & Conditions:', 14, tY);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(80);
        doc.text('1. Sold goods will not be returned.', 14, tY + 5);
        doc.text('2. Warranty will be strictly as per manufacturer/company.', 14, tY + 10);

        // ── Signatures ────────────────────────────────────────────────────────
        const sY = tY + 22;
        doc.setDrawColor(180, 60, 0); doc.setLineWidth(0.4);
        doc.line(14, sY, pageW - 14, sY);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(60);
        doc.text('Customer Signature', 20, sY + 12); doc.line(14, sY + 14, 72, sY + 14);
        doc.setFont('helvetica', 'bold'); doc.setTextColor(0);
        doc.text('For: Siddhesh Telecome Services', rX, sY + 10, { align: 'right' });
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(80);
        doc.text('Authorized Signatory', rX, sY + 15, { align: 'right' });
        doc.line(rX - 55, sY + 17, rX, sY + 17);

        doc.save(`Invoice_${order.orderId || order._id}.pdf`);
    };

    const handlePrint = () => window.print();

    // ── Loading / Error States ────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading invoice…</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Invoice Not Found</h2>
                    <p className="text-gray-500 mb-6">{error || 'We could not find this order.'}</p>
                    <Link to="/my-orders" className="bg-orange-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-orange-700 transition">
                        ← Back to My Orders
                    </Link>
                </div>
            </div>
        );
    }

    const customerName = order.userDetails?.name || 'Customer';
    const customerPhone = order.userDetails?.phone || order.shippingAddress?.phone || '—';
    const addr = order.shippingAddress;
    const billNo = order.orderId || order._id?.slice(-8).toUpperCase();
    const invoiceDate = fmtDate(order.createdAt);

    // ── Back link: admins go to admin panel, users go to my-orders ───────────
    const backLink = user?.role === 'admin' ? '/admin/orders' : '/my-orders';
    const backLabel = user?.role === 'admin' ? '← Admin Panel' : '← My Orders';

    return (
        <>
            {/* ── Toolbar (hidden on print) ─────────────────────────────────── */}
            <div className="no-print bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
                    <Link to={backLink} className="flex items-center gap-1.5 text-gray-600 hover:text-orange-600 transition text-sm font-medium">
                        <ArrowLeft className="w-4 h-4" />
                        {backLabel}
                    </Link>

                    <div className="flex items-center gap-2">
                        <span className="hidden sm:flex items-center gap-1.5 text-gray-500 text-sm">
                            <FileText className="w-4 h-4" />
                            Invoice #{billNo}
                        </span>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                        >
                            <Printer className="w-4 h-4" />
                            <span className="hidden sm:inline">Print</span>
                        </button>
                        <button
                            onClick={handleDownload}
                            disabled={downloading}
                            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow"
                        >
                            <Download className="w-4 h-4" />
                            <span>{downloading ? 'Generating…' : 'Download PDF'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Invoice Document ─────────────────────────────────────────── */}
            <div className="bg-gray-100 min-h-screen py-8 px-4 print:bg-white print:p-0 print:m-0">
                <div
                    ref={invoiceRef}
                    id="invoice-document"
                    className="bg-white max-w-[794px] mx-auto shadow-xl print:shadow-none font-sans text-gray-800"
                    style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}
                >
                    {/* ═══ STORE HEADER ═══════════════════════════════════════ */}
                    <div className="border-b-4 border-orange-600 px-8 pt-8 pb-5">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            {/* Left: Store info */}
                            <div className="flex-1">
                                <h1 className="text-2xl font-extrabold text-orange-700 leading-tight tracking-tight">
                                    Siddhesh Telecome Services
                                </h1>
                                <p className="text-sm font-semibold text-gray-600 mt-0.5">Cash Memo / Tax Invoice</p>
                                <p className="text-xs text-gray-500 mt-1.5 font-medium">GST No: <span className="font-bold text-gray-700">27AUCPV6162E1ZG</span></p>
                                <div className="mt-2 text-xs text-gray-600 space-y-0.5 leading-relaxed">
                                    <p>Lavthalswar, Oppo. Anandi Hospital</p>
                                    <p>Jejuri, Tal-Purandhar, Dist-Pune</p>
                                </div>
                                <p className="text-xs text-gray-500 mt-2 italic">
                                    Owner: Mahesh Mhetre<br />Telecome Services
                                </p>
                            </div>

                            {/* Right: Bill meta */}
                            <div className="sm:text-right bg-orange-50 border border-orange-200 rounded-xl p-4 min-w-[180px]">
                                <div className="mb-3">
                                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Bill No</p>
                                    <p className="text-base font-bold text-orange-700 font-mono mt-0.5">{billNo}</p>
                                </div>
                                <div className="mb-3">
                                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Invoice Date</p>
                                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{invoiceDate}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Payment</p>
                                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                                        {order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}
                                    </p>
                                    <span className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full ${order.paymentStatus === 'Paid'
                                            ? 'bg-green-100 text-green-700'
                                            : order.paymentStatus === 'Failed'
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {order.paymentStatus}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="mt-3 pt-3 border-t border-orange-100">
                            <p className="text-xs text-gray-500">
                                📞 <span className="font-semibold text-gray-700">9822521992 / 9923777771</span>
                            </p>
                        </div>
                    </div>

                    {/* ═══ CUSTOMER DETAILS ════════════════════════════════════ */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 border-b border-gray-200">
                        <div className="px-8 py-4">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Billed To</h3>
                            <p className="font-bold text-gray-900 text-base">{customerName}</p>
                            <p className="text-sm text-gray-600 mt-1">📞 {customerPhone}</p>
                            {order.userDetails?.email && (
                                <p className="text-sm text-gray-500">✉ {order.userDetails.email}</p>
                            )}
                        </div>
                        <div className="px-8 py-4">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Delivery Address</h3>
                            <p className="text-sm text-gray-700 leading-relaxed">
                                {addr?.address && <span className="block">{addr.address}</span>}
                                {(addr?.city || addr?.pincode) && (
                                    <span className="block">{addr.city}{addr.pincode ? ` - ${addr.pincode}` : ''}</span>
                                )}
                            </p>
                            {addr?.phone && addr.phone !== customerPhone && (
                                <p className="text-sm text-gray-500 mt-1">📞 {addr.phone}</p>
                            )}
                        </div>
                    </div>

                    {/* ═══ PRODUCT TABLE ═══════════════════════════════════════ */}
                    <div className="px-0">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-orange-700 text-white">
                                    <th className="py-3 px-3 text-center font-bold w-10 text-xs">Sr.</th>
                                    <th className="py-3 px-4 text-left font-bold text-xs">Particulars</th>
                                    <th className="py-3 px-3 text-center font-bold w-14 text-xs">Qty</th>
                                    <th className="py-3 px-4 text-right font-bold w-32 text-xs">Rate</th>
                                    <th className="py-3 px-4 text-right font-bold w-32 text-xs">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(order.orderItems || []).map((item, i) => (
                                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-orange-50'}>
                                        <td className="py-3 px-3 text-center text-gray-500 font-medium text-xs border-b border-gray-100">
                                            {i + 1}
                                        </td>
                                        <td className="py-3 px-4 border-b border-gray-100">
                                            <div className="flex items-center gap-3">
                                                {item.image && (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-10 h-10 object-contain rounded border border-gray-200 bg-white p-0.5 flex-shrink-0 print-hide"
                                                        crossOrigin="anonymous"
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                )}
                                                <div>
                                                    <p className="font-semibold text-gray-900 text-sm leading-tight">{item.name}</p>
                                                    {item.category && (
                                                        <p className="text-xs text-gray-400 mt-0.5">Category: {item.category}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-3 text-center font-semibold text-gray-800 border-b border-gray-100 text-sm">
                                            {item.quantity}
                                        </td>
                                        <td className="py-3 px-4 text-right text-gray-700 border-b border-gray-100 text-sm">
                                            ₹{fmt(item.price)}
                                        </td>
                                        <td className="py-3 px-4 text-right font-semibold text-gray-900 border-b border-gray-100 text-sm">
                                            ₹{fmt(item.price * item.quantity)}
                                        </td>
                                    </tr>
                                ))}

                                {/* Filler rows to pad table */}
                                {(order.orderItems || []).length < 4 &&
                                    Array.from({ length: 4 - (order.orderItems || []).length }).map((_, i) => (
                                        <tr key={`filler-${i}`} className={((order.orderItems?.length || 0) + i) % 2 === 0 ? 'bg-white' : 'bg-orange-50'}>
                                            <td className="py-4 px-3 border-b border-gray-100">&nbsp;</td>
                                            <td className="py-4 px-4 border-b border-gray-100"></td>
                                            <td className="py-4 px-3 border-b border-gray-100"></td>
                                            <td className="py-4 px-4 border-b border-gray-100"></td>
                                            <td className="py-4 px-4 border-b border-gray-100"></td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>

                    {/* ═══ PRICE SUMMARY ═══════════════════════════════════════ */}
                    <div className="px-8 py-5 flex flex-col sm:flex-row gap-6 border-b border-gray-200">
                        {/* Left: spacer / tracking info */}
                        <div className="flex-1">
                            {order.trackingId && (
                                <div className="inline-block bg-purple-50 border border-purple-200 rounded-lg px-4 py-2">
                                    <p className="text-xs text-purple-500 font-semibold uppercase tracking-wide">Tracking ID</p>
                                    <p className="text-sm font-bold text-purple-700 font-mono mt-0.5">{order.trackingId}</p>
                                </div>
                            )}
                            <div className="mt-3">
                                <p className="text-xs text-gray-400">Order Status</p>
                                <span className={`inline-block mt-1 text-xs font-bold px-2.5 py-1 rounded-full ${order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                                        order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                            'bg-blue-100 text-blue-700'
                                    }`}>
                                    {order.orderStatus}
                                </span>
                            </div>
                        </div>

                        {/* Right: calculation box */}
                        <div className="sm:w-72 border border-orange-200 rounded-xl overflow-hidden">
                            <div className="bg-orange-700 text-white text-xs font-bold uppercase tracking-wide px-4 py-2">
                                Price Summary
                            </div>
                            <div className="divide-y divide-orange-100">
                                <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                                    <span className="text-gray-600">Gross Amount</span>
                                    <span className="font-semibold text-gray-800">₹{fmt(grossAmount)}</span>
                                </div>
                                <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                                    <span className="text-gray-600">Delivery Fee</span>
                                    <span className="font-semibold text-gray-800">₹{fmt(deliveryFee)}</span>
                                </div>
                                <div className="flex justify-between items-center px-4 py-2.5 text-sm bg-orange-50">
                                    <span className="text-gray-600">ADD CGST <span className="text-xs text-gray-400">(9%)</span></span>
                                    <span className="font-semibold text-orange-700">₹{fmt(cgst)}</span>
                                </div>
                                <div className="flex justify-between items-center px-4 py-2.5 text-sm bg-orange-50">
                                    <span className="text-gray-600">ADD SGST <span className="text-xs text-gray-400">(9%)</span></span>
                                    <span className="font-semibold text-orange-700">₹{fmt(sgst)}</span>
                                </div>
                                <div className="flex justify-between items-center px-4 py-3 bg-orange-700 text-white">
                                    <span className="font-bold text-sm">Invoice Value</span>
                                    <span className="font-extrabold text-base">₹{fmt(grandTotal)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ═══ TERMS & CONDITIONS ══════════════════════════════════ */}
                    <div className="px-8 py-4 border-b border-gray-200 bg-gray-50">
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Terms &amp; Conditions</h4>
                        <ol className="list-decimal list-inside text-xs text-gray-500 space-y-1">
                            <li>Sold goods will not be returned.</li>
                            <li>Warranty will be strictly as per manufacturer/company.</li>
                        </ol>
                    </div>

                    {/* ═══ SIGNATURE SECTION ═══════════════════════════════════ */}
                    <div className="px-8 py-6 grid grid-cols-2 gap-8">
                        {/* Customer Signature */}
                        <div>
                            <div className="h-14 border-b border-gray-400 mb-2"></div>
                            <p className="text-xs font-semibold text-gray-600 text-center">Customer Signature</p>
                        </div>

                        {/* Authorized Signatory */}
                        <div className="text-right">
                            <div className="h-14 flex items-center justify-end mb-2">
                                {/* Stamp placeholder */}
                                <div className="w-16 h-16 rounded-full border-2 border-dashed border-orange-300 flex items-center justify-center bg-orange-50">
                                    <p className="text-[8px] text-orange-400 text-center font-semibold leading-tight">STAMP</p>
                                </div>
                            </div>
                            <div className="border-t border-gray-400 mt-2 pt-2">
                                <p className="text-xs font-bold text-gray-800">For: Siddhesh Telecome Services</p>
                                <p className="text-xs text-gray-500 mt-0.5">Authorized Signatory</p>
                            </div>
                        </div>
                    </div>

                    {/* ═══ FOOTER ══════════════════════════════════════════════ */}
                    <div className="bg-orange-700 text-white text-center py-3 px-8">
                        <p className="text-xs font-medium">
                            Thank you for shopping with <strong>Siddhesh Telecome Services</strong>!
                        </p>
                        <p className="text-xs text-orange-200 mt-0.5">
                            This is a computer-generated invoice and does not require a physical signature.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Print-only styles injected via JSX ───────────────────────── */}
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #invoice-document, #invoice-document * { visibility: visible; }
                    #invoice-document {
                        position: absolute;
                        left: 0; top: 0;
                        width: 100%;
                        box-shadow: none;
                        margin: 0;
                        padding: 0;
                    }
                    .no-print { display: none !important; }
                    .print-hide { display: none !important; }
                }
            `}</style>
        </>
    );
}
