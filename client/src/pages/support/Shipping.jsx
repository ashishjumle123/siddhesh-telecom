import React from 'react';

export default function Shipping() {
    return (
        <div className="bg-[#f1f3f6] min-h-screen py-8 md:py-12">
            <div className="max-w-[1000px] mx-auto bg-white p-6 md:p-10 rounded-lg shadow-sm border border-gray-100">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 border-b pb-4">Shipping Policy</h1>

                <div className="space-y-8 text-gray-700 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">Order Processing Time</h2>
                        <p>All finalized orders are processed and prepared for dispatch within <strong>1–2 business days</strong>. Orders are not shipped or delivered on weekends or public holidays.</p>
                        <p className="mt-2">If we are experiencing a high volume of orders, shipments may be delayed by a few days. Please allow additional days in transit for delivery.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">Shipping Duration & Rates</h2>
                        <div className="overflow-x-auto mt-4">
                            <table className="min-w-full text-sm text-left text-gray-600 border border-gray-200">
                                <thead className="bg-gray-50 text-gray-800 uppercase text-xs border-b">
                                    <tr>
                                        <th className="px-6 py-3 border-r">Delivery Type</th>
                                        <th className="px-6 py-3 border-r">Estimated Delivery Time</th>
                                        <th className="px-6 py-3">Shipping Cost</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b">
                                        <td className="px-6 py-4 border-r font-medium">Standard Delivery</td>
                                        <td className="px-6 py-4 border-r">3-7 Business Days</td>
                                        <td className="px-6 py-4">Calculated at Checkout</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-6 py-4 border-r font-medium">Heavy Goods (Furniture/Appliances)</td>
                                        <td className="px-6 py-4 border-r">5-10 Business Days</td>
                                        <td className="px-6 py-4">Varies by weight & PIN code</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">Delivery Locations</h2>
                        <p>Siddhesh Telecome Services currently ships to addresses within India. We strive to cover all major pin codes, though delivery to remote or highly restricted areas may take additional time.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">Order Tracking</h2>
                        <p>Once your order is shipped, we will send an email confirmation carrying a tracking link. You can also view your shipment status securely from the <strong>My Orders</strong> section of your account Profile.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
