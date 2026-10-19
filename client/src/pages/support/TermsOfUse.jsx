import React from 'react';

export default function TermsOfUse() {
    return (
        <div className="bg-[#f1f3f6] min-h-screen py-8 md:py-12">
            <div className="max-w-[1000px] mx-auto bg-white p-6 md:p-10 rounded-lg shadow-sm border border-gray-100">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 border-b pb-4">Terms of Use</h1>

                <div className="space-y-8 text-gray-700 leading-relaxed text-sm lg:text-base">
                    <p>Welcome to Siddhesh Telecome Services. By continuing to browse and use this website, you are agreeing to comply with and be bound by the following terms and conditions of use.</p>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Account Security & User Responsibilities</h2>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                            <li>To access certain features (like checking out), you must register and create an account. You are responsible for protecting the confidentiality of your password and securing your account portal.</li>
                            <li>You agree to accept responsibility for all activities that occur under your account credentials.</li>
                            <li>You must provide true, accurate, and current information when creating an account or filling out shipping/billing data.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Prohibited Activities</h2>
                        <p className="mb-2">You agree not to engage in any of the following restricted activities:</p>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                            <li>Using the website for any illegal purpose or in violation of any local, state, or international law.</li>
                            <li>Attempting to interfere with the network security, or attempting to use the service to gain unauthorized access to any other computer system.</li>
                            <li>Using scrapers, spiders, or automated scripts to systematically harvest data from the product listings or reviews.</li>
                            <li>Posting deliberately false statements, abusive reviews, or obscene commentary.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Intellectual Property</h2>
                        <p>All content included on this site—such as text, graphics, logos, button icons, images, audio clips, digital downloads, data compilations, and overall software—is the intellectual property of Siddhesh Telecome Services or its authorized content suppliers. It is protected by applicable national and international copyright laws.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Pricing and Typographical Errors</h2>
                        <p>While we strive to provide accurate product and pricing information, pricing or typographical errors may occur. In the event that an item is listed at an incorrect price due to an error, we hold the right, at our sole discretion, to refuse or cancel any orders placed for that item.</p>
                    </section>

                    <section className="bg-gray-50 p-6 rounded-lg mt-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Limitation of Liability</h2>
                        <p>
                            In no event shall Siddhesh Telecome Services, its owner, employees, or retail partners be liable for any indirect, punitive, incidental, special, or consequential damages arising out of or in any way connected with the use of this website or the delay/inability to use this website. This limitation applies whether based on contract, tort, strict liability, or otherwise.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
