import React from 'react';

export default function About() {
    return (
        <div className="bg-[#f1f3f6] min-h-screen py-8 md:py-12">
            <div className="max-w-[1000px] mx-auto bg-white p-6 md:p-10 rounded-lg shadow-sm border border-gray-100">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 border-b pb-4">About Siddhesh Telecome Services</h1>

                <div className="space-y-8 text-gray-700 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Introduction</h2>
                        <p>
                            Welcome to <strong>Siddhesh Telecome Services</strong> (सिद्धेश टेलीकॉम सर्विसेज). We are a premier online store dedicated to providing high-quality telecommunications products and services to homes across India. Our goal is to bring convenience and quality directly to your doorstep.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Our Mission</h2>
                        <p>
                            Our mission is to provide customers with premium products at highly competitive prices, backed by reliable, fast delivery and exceptional customer service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Our Vision</h2>
                        <p>
                            To become the most trusted and preferred online shopping platform in the region by continually offering seamless, reliable, and delightful shopping experiences.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Our Services</h2>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                            <li>Wide range of Electronics Products</li>
                            <li>Durable Home Appliances</li>
                            <li>Quality Furniture</li>
                            <li>Secure Online Payments & Cash on Delivery</li>
                            <li>Dedicated Customer Support</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Customer Commitment</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                            <div className="bg-blue-50 p-6 rounded-lg text-center">
                                <h3 className="font-bold text-[#2874f0] text-lg mb-2">Fast Delivery</h3>
                                <p className="text-sm">We partner with top logistic services to ensure your orders reach you promptly.</p>
                            </div>
                            <div className="bg-green-50 p-6 rounded-lg text-center">
                                <h3 className="font-bold text-green-600 text-lg mb-2">Secure Payment</h3>
                                <p className="text-sm">Your transactions are protected with industry-standard encryption protocols.</p>
                            </div>
                            <div className="bg-amber-50 p-6 rounded-lg text-center">
                                <h3 className="font-bold text-amber-600 text-lg mb-2">100% Satisfaction</h3>
                                <p className="text-sm">We stand behind the quality of our products with hassle-free return policies.</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
