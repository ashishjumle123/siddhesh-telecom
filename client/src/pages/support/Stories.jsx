import React from 'react';
import { Target, TrendingUp, Star, Award } from 'lucide-react';

export default function Stories() {
    return (
        <div className="bg-[#f1f3f6] min-h-screen py-8 md:py-12">
            <div className="max-w-[1000px] mx-auto bg-white p-6 md:p-10 rounded-lg shadow-sm border border-gray-100">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 border-b pb-4">Siddhesh Stories</h1>
                    <p className="text-gray-500 mt-4 max-w-2xl mx-auto italic">"Every great business begins with a simple, genuine intention to serve the community."</p>
                </div>

                <div className="space-y-10 text-gray-700 leading-relaxed relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">

                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-[#2874f0] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                            <Target className="w-5 h-5" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
                            <h3 className="font-bold text-gray-800 text-xl mb-2">Our Journey</h3>
                            <p className="text-sm md:text-base">Siddhesh Telecome Services started with a humble yet powerful mission: to provide high-quality telecommunications products and services at affordable prices. We recognized the gap between premium retail pricing and what hard-working families could afford.</p>
                        </div>
                    </div>

                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-green-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
                            <h3 className="font-bold text-gray-800 text-xl mb-2">Our Growth</h3>
                            <p className="text-sm md:text-base">Over the years, fueled by community trust, we have rapidly expanded our product range and consistently modernized our digital services to not just meet, but exceed customer expectations in the fast-paced e-commerce era.</p>
                        </div>
                    </div>

                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-amber-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                            <Star className="w-5 h-5" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
                            <h3 className="font-bold text-gray-800 text-xl mb-2">Customer Satisfaction</h3>
                            <p className="text-sm md:text-base">Our core focus remains razor-sharp: delivering only trusted, branded goods safely to your door. From implementing secure Razorpay gateways to ensuring transparent, reliable delivery tracking, the customer's peace of mind is paramount.</p>
                        </div>
                    </div>

                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-purple-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                            <Award className="w-5 h-5" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
                            <h3 className="font-bold text-gray-800 text-xl mb-2">Community Connection</h3>
                            <p className="text-sm md:text-base">Our brand is deeply inspired by the commitment to serve our community with quality telecommunications services. Every order we process is treated with that same respect, hoping to bring joy and utility into the homes of our community.</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
