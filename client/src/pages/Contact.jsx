import React, { useState } from 'react';
import BASE_URL from '../api';
import axios from 'axios';
import { Store, User, MapPin, Phone, Mail, Instagram } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(`${BASE_URL}/api/contact`, formData);
            if (response.data.success) {
                toast.success('Your message has been sent successfully!');
                setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' }); // Reset form
            } else {
                toast.error('Failed to send message. Please try again.');
            }
        } catch (error) {
            console.error("Contact Form Error:", error);
            toast.error('An error occurred while sending your message.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full bg-[#f1f3f6] min-h-screen py-8 pb-32">
            <div className="max-w-[1200px] mx-auto px-4 md:px-0">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Contact Us</h1>
                    <p className="text-gray-600">We'd love to hear from you. Please reach out with any questions or inquiries.</p>
                </div>

                {/* Two Column Layout for Contact Info and Form */}
                <div className="flex flex-col md:flex-row gap-8 mb-12">

                    {/* Left Section - Shop Information */}
                    <div className="w-full md:w-1/3 bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-4">Our Details</h2>

                            <div className="space-y-5">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-50 text-[#2874f0] rounded-full">
                                        <Store className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Shop Name</p>
                                        <p className="text-gray-800 font-medium">Siddhesh Telecome Services</p>
                                        <p className="text-gray-500 text-sm">(सिद्धेश टेलीकॉम सर्विसेज)</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-50 text-[#2874f0] rounded-full">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Owner</p>
                                        <p className="text-gray-800 font-medium">Mahesh Mhetre</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-50 text-[#2874f0] rounded-full">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Address</p>
                                        <p className="text-gray-800 leading-relaxed">
                                            Lavthalswar, Oppo. Anandi Hospital<br />
                                            Jejuri, Tal-Purandhar<br />
                                            Dist-Pune, Maharashtra<br />
                                            India
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-50 text-[#2874f0] rounded-full">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Phone</p>
                                        <p className="text-gray-800">+91 9822521992</p>
                                        <p className="text-gray-800">+91 9923777771</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-50 text-[#2874f0] rounded-full">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</p>
                                        <a href="mailto:sidheshtelecom2@gmail.com" className="text-[#2874f0] hover:underline">
                                            sidheshtelecom2@gmail.com
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-pink-50 text-pink-600 rounded-full">
                                        <Instagram className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Instagram</p>
                                        <a
                                            href="https://www.instagram.com/new_siddhesh_telecom?utm_source=ig_web_button_share_sheet&cplk=ZDNlZDc0MzIxNw=="
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#2874f0] hover:underline font-medium"
                                        >
                                            Siddhesh Telecom Services (@new_siddhesh_telecom)
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Media Links */}
                        <div className="mt-10 pt-6 border-t border-gray-100 flex gap-4">
                            <a
                                href="https://wa.me/919822521992"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 text-center py-2 px-4 bg-green-50 text-green-600 rounded-md font-medium hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 3.825 0 6.938 3.112 6.938 6.937 0 3.825-3.113 6.938-6.938 6.938z" /></svg>
                                WhatsApp
                            </a>
                            <a
                                href="https://www.instagram.com/new_siddhesh_telecom?utm_source=ig_web_button_share_sheet&cplk=ZDNlZDc0MzIxNw=="
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Siddhesh Telecom Services (@new_siddhesh_telecom)"
                                className="flex-1 text-center py-2 px-4 bg-pink-50 text-pink-600 rounded-md font-medium hover:bg-pink-100 transition-colors flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                Instagram
                            </a>
                        </div>
                    </div>

                    {/* Right Section - Contact Form */}
                    <div className="w-full md:w-2/3 bg-white p-6 md:p-10 rounded-lg shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Send us a Message</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0] focus:border-transparent transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>
                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0] focus:border-transparent transition-all"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            {/* Subject */}
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                <select
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0] focus:border-transparent transition-all bg-white"
                                >
                                    <option value="General Inquiry">General Inquiry</option>
                                    <option value="Product Information">Product Information</option>
                                    <option value="Order Support">Order Support</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            {/* Message */}
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Your Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="5"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0] focus:border-transparent transition-all resize-none"
                                    placeholder="How can we help you today?"
                                ></textarea>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full md:w-auto px-8 py-3 bg-[#2874f0] text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-[#2874f0] focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Sending Message...' : 'Send Message'}
                            </button>
                        </form>
                    </div>

                </div>

                {/* Bottom Section - Location Map */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 px-2">Find Us Here</h2>
                    <div className="w-full h-[400px] bg-gray-200 rounded-lg overflow-hidden relative">
                        {/* Note: I'm passing Nagpur's coordinate string generically, since Google Maps requires an API key for dynamic embeds or specifically finding this local spot. This embed link is a generic search fallback. */}
                        <iframe
                            src="https://maps.google.com/maps?q=Jejuri,%20Purandhar,%20Pune,%20Maharashtra&t=&z=13&ie=UTF8&iwloc=&output=embed"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Shop Location"
                        ></iframe>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Contact;
