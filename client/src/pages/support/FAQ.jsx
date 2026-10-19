import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
    {
        question: "How do I place an order?",
        answer: "To place an order, browse through our categories, click on the product you want to buy, and select 'Buy Now'. You will be redirected to the checkout page where you can enter your shipping details and select a payment method to complete the purchase."
    },
    {
        question: "How can I track my order?",
        answer: "Once your order is successfully dispatched, you will receive an email containing your tracking ID. Additionally, you can log in to your account, go to 'My Profile' -> 'My Orders', and select the specific order to view its real-time tracking status."
    },
    {
        question: "What payment methods are available?",
        answer: "We offer completely secure online payments via Razorpay (which supports Credit/Debit cards, UPI, and Net Banking). We also offer Cash on Delivery (COD) for eligible pin codes."
    },
    {
        question: "How do I request a return?",
        answer: "If you receive a defective or damaged product, navigate to the 'My Orders' section in your account within 7 days of delivery. Select the order and click 'Return Item'. Follow the on-screen instructions to submit a return request."
    },
    {
        question: "How long does shipping take?",
        answer: "Standard delivery orders generally arrive within 3 to 7 business days, depending heavily on your location. Heavy items like large furniture may take between 5 to 10 days."
    },
    {
        question: "How can I contact customer support?",
        answer: "You can reach us directly by calling +91 9822521992 or +91 9923777771. Alternatively, you can email us at sidheshtelecom2@gmail.com or use the 'Contact Us' form available on our website."
    }
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleFaq = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="bg-[#f1f3f6] min-h-screen py-8 md:py-12">
            <div className="max-w-[1000px] mx-auto bg-white p-6 md:p-10 rounded-lg shadow-sm border border-gray-100">
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 border-b pb-4">Frequently Asked Questions</h1>
                    <p className="text-gray-500 mt-4">Find answers to common questions about shopping with Siddhesh Telecome Services.</p>
                </div>

                <div className="space-y-4 max-w-3xl mx-auto">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200">
                            <button
                                onClick={() => toggleFaq(index)}
                                className="w-full flex justify-between items-center p-5 bg-gray-50 hover:bg-gray-100 focus:outline-none transition-colors"
                            >
                                <span className="font-semibold text-gray-800 text-left">{faq.question}</span>
                                {openIndex === index ? (
                                    <ChevronUp className="w-5 h-5 text-[#2874f0] shrink-0" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                                )}
                            </button>

                            {openIndex === index && (
                                <div className="p-5 bg-white text-gray-600 leading-relaxed border-t border-gray-200 animate-in slide-in-from-top-2">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
