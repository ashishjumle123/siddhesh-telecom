import React from 'react';
import { Briefcase, Users, TrendingUp, Heart } from 'lucide-react';

export default function Careers() {
    return (
        <div className="bg-[#f1f3f6] min-h-screen py-8 md:py-12">
            <div className="max-w-[1000px] mx-auto bg-white p-6 md:p-10 rounded-lg shadow-sm border border-gray-100">
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 border-b pb-4">Careers at Siddhesh Telecome Services</h1>
                    <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
                        Siddhesh Telecome Services is a growing retail platform specializing in telecommunications products and services. We are always looking for talented individuals who want to grow their careers in the exciting retail industry.
                    </p>
                </div>

                <div className="space-y-12">
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Why Work With Us</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-blue-50 p-6 rounded-lg text-center flex flex-col items-center">
                                <Users className="w-8 h-8 text-[#2874f0] mb-3" />
                                <h3 className="font-bold text-gray-800 mb-2">Friendly Environment</h3>
                                <p className="text-sm text-gray-600">Work in a collaborative, supportive space where every voice is heard.</p>
                            </div>
                            <div className="bg-green-50 p-6 rounded-lg text-center flex flex-col items-center">
                                <TrendingUp className="w-8 h-8 text-green-600 mb-3" />
                                <h3 className="font-bold text-gray-800 mb-2">Career Growth</h3>
                                <p className="text-sm text-gray-600">Continuous learning opportunities and clear paths for promotion.</p>
                            </div>
                            <div className="bg-purple-50 p-6 rounded-lg text-center flex flex-col items-center">
                                <Briefcase className="w-8 h-8 text-purple-600 mb-3" />
                                <h3 className="font-bold text-gray-800 mb-2">Innovative Culture</h3>
                                <p className="text-sm text-gray-600">Be part of a team that embraces new technology and bold ideas.</p>
                            </div>
                            <div className="bg-amber-50 p-6 rounded-lg text-center flex flex-col items-center">
                                <Heart className="w-8 h-8 text-amber-600 mb-3" />
                                <h3 className="font-bold text-gray-800 mb-2">Competitive Benefits</h3>
                                <p className="text-sm text-gray-600">Enjoy attractive salary packages, performance bonuses, and perks.</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Available Opportunities</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                "Customer Support Executive",
                                "Warehouse Assistant",
                                "Delivery Partner",
                                "Digital Marketing Executive",
                                "Store Manager"
                            ].map((role, idx) => (
                                <div key={idx} className="border border-gray-200 p-4 rounded flex items-center justify-between hover:shadow-md transition-shadow bg-gray-50 hover:bg-white cursor-pointer group">
                                    <span className="font-medium text-gray-700 group-hover:text-[#2874f0] transition-colors">{role}</span>
                                    <span className="text-sm text-gray-400">Full Time</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-gray-800 text-white p-8 rounded-lg text-center mt-8">
                        <h2 className="text-2xl font-semibold mb-4">Ready to Join Our Journey?</h2>
                        <p className="mb-6 text-gray-300">Interested candidates can send their resume directly to our HR department.</p>
                        <a
                            href="mailto:sidheshtelecom2@gmail.com"
                            className="inline-block bg-[#2874f0] hover:bg-blue-600 text-white px-8 py-3 rounded-md font-medium transition-colors"
                        >
                            Email us: sidheshtelecom2@gmail.com
                        </a>
                    </section>
                </div>
            </div>
        </div>
    );
}
