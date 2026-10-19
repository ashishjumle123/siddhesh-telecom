import React from 'react';

export default function PrivacyPolicy() {
    return (
        <div className="bg-[#f1f3f6] min-h-screen py-8 md:py-12">
            <div className="max-w-[1000px] mx-auto bg-white p-6 md:p-10 rounded-lg shadow-sm border border-gray-100">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 border-b pb-4">Privacy Policy</h1>

                <div className="space-y-8 text-gray-700 leading-relaxed text-sm lg:text-base">
                    <p>At Siddhesh Telecome Services, we value your trust and respect your privacy. This Privacy Policy details the information we collect, how it is handled, and the choices you have concerning your data.</p>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">Information We Collect</h2>
                        <p className="mb-2">We collect only necessary personal data to process your shopping request effectively. This includes:</p>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                            <li><strong>Identity Data:</strong> Name, Username/Password (Encrypted)</li>
                            <li><strong>Contact Data:</strong> Email address, Mobile number</li>
                            <li><strong>Delivery Data:</strong> Shipping address, Billing address, PIN codes</li>
                            <li><strong>Transaction Data:</strong> Details about payments (No raw credit card digits are stored directly on our servers).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">How Your Data is Used</h2>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                            <li>To fulfill and manage purchases, orders, payments, and returns.</li>
                            <li>To securely deliver products through our third-party logistics partners.</li>
                            <li>To send you administrative information, such as order confirmations or policy updates.</li>
                            <li>To investigate and prevent fraudulent transactions, unauthorized access, and other illegal activities.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">Payment Security</h2>
                        <p>We use Razorpay as a premier payment gateway for all digital transactions. We do not store your full debit/credit card details or net banking credentials. Your transaction data is encrypted securely following PCI-DSS standards maintained by the gateway provider.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">Third-Party Services</h2>
                        <p>Your delivery address and contact number are shared strictly with our courier partners to facilitate door delivery. Aside from necessary logistical and payment operations, we <strong>do not sell, trade, or rent</strong> your personal identification information to independent third parties under any circumstances.</p>
                    </section>

                    <section className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">User Rights</h2>
                        <p className="mb-2">As an active user on our platform, you have the right to:</p>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                            <li>Access and view your personal data at any time via your Profile dashboard.</li>
                            <li>Modify or correct inaccurate shipping addresses and phone numbers.</li>
                            <li>Request the deletion of your account and its associated order history by contacting our support desk.</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}
