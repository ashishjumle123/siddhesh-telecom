import React from 'react';

export default function Cancellation() {
    return (
        <div className="bg-[#f1f3f6] min-h-screen py-8 md:py-12">
            <div className="max-w-[1000px] mx-auto bg-white p-6 md:p-10 rounded-lg shadow-sm border border-gray-100">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 border-b pb-4">Cancellation Policy</h1>

                <div className="space-y-8 text-gray-700 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">Order Cancellation by Customer</h2>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                            <li>Orders can only be cancelled <strong>before they are dispatched</strong> from our fulfillment center.</li>
                            <li>To cancel an order, navigate to "My Orders" in your profile, select the active order, and click "Cancel".</li>
                            <li>If the order has already been shipped (Status: "Shipped" or "Out for Delivery"), the strict cancellation window has passed. You may choose to refuse the delivery when the courier arrives, and it will be processed as a return.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">Order Cancellation by Siddhesh Telecome Services</h2>
                        <p className="mb-2">There may be certain circumstances where we are forced to cancel an accepted order. These include:</p>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                            <li>Non-availability of the product in our primary inventory.</li>
                            <li>Inaccuracies or errors in product pricing or technical description information.</li>
                            <li>Identified potential fraud by our payment gateway providers.</li>
                            <li>Unserviceable delivery pin codes.</li>
                        </ul>
                    </section>

                    <section className="bg-blue-50 p-6 rounded-lg border border-blue-100 mt-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">Refunds on Cancellation</h2>
                        <p>
                            If an order is cancelled successfully before it is shipped, the entire amount paid (including shipping charges) will be refunded.
                            Refunds are generally processed back to the original source of funds within <strong>5–7 business days</strong>. Wait times may vary depending on your bank's specific clearing cycles.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
