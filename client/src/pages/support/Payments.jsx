import React from 'react';
import { CreditCard, Smartphone, ShieldCheck, MailCheck, RefreshCcw } from 'lucide-react';

export default function Payments() {
    return (
        <div className="bg-[#f1f3f6] min-h-screen py-8 md:py-12">
            <div className="max-w-[1000px] mx-auto bg-white p-6 md:p-10 rounded-lg shadow-sm border border-gray-100">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 border-b pb-4 text-center">Secure Payment Options</h1>

                <div className="space-y-10 text-gray-700 leading-relaxed">

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-[#2874f0]" />
                            Accepted Payment Methods
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {['Credit Cards', 'Debit Cards', 'UPI Forms', 'Net Banking', 'Cash on Delivery'].map((method, idx) => (
                                <div key={idx} className="bg-gray-50 border border-gray-200 p-3 rounded text-center text-sm font-medium text-gray-700">
                                    {method}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Supported Payment Providers</h2>
                        <div className="flex flex-wrap gap-4 items-center">
                            {/* Visual pill badges for providers */}
                            <span className="px-4 py-2 bg-blue-50 text-blue-800 border border-blue-200 rounded-full font-bold text-sm">VISA</span>
                            <span className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-full font-bold text-sm">MasterCard</span>
                            <span className="px-4 py-2 bg-sky-50 text-sky-700 border border-sky-200 rounded-full font-bold text-sm">American Express</span>
                            <span className="px-4 py-2 bg-orange-50 text-orange-700 border border-orange-200 rounded-full font-bold text-sm">RuPay</span>
                            <span className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-full font-bold text-sm flex items-center gap-1"><Smartphone className="w-4 h-4" /> UPI Apps</span>
                        </div>
                    </section>

                    <section className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white text-[#2874f0] rounded-full shadow-sm shrink-0">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">Payment Security</h2>
                                <p>We take your privacy seriously. All payments are securely routed and processed through heavily encrypted payment gateways (Razorpay). Siddhesh Telecome Services does not intercept, read, or store your raw credit card data or banking passcodes at any point during checkout.</p>
                            </div>
                        </div>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <section className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3 mb-3">
                                <MailCheck className="w-6 h-6 text-green-600" />
                                <h2 className="text-xl font-semibold text-gray-800">Order Confirmation</h2>
                            </div>
                            <p className="text-sm">Immediately after a successful payment capture, customers will receive an automated order confirmation receipt through their registered email address.</p>
                        </section>

                        <section className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3 mb-3">
                                <RefreshCcw className="w-6 h-6 text-amber-600" />
                                <h2 className="text-xl font-semibold text-gray-800">Refund Process</h2>
                            </div>
                            <p className="text-sm">If an order is cancelled prior to shipment or successfully returned after delivery, the validated refund amounts are processed directly back to the original source. Expect the funds to reflect within <strong>5–7 business days</strong>.</p>
                        </section>
                    </div>

                </div>
            </div>
        </div>
    );
}
