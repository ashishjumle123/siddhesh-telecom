import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-[#172337] text-gray-300 pt-12 pb-24 md:pb-8 mt-12 w-full">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">

                {/* About Section */}
                <div>
                    <h3 className="text-gray-400 font-semibold mb-4 uppercase text-xs">About</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                        <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                        <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                        <li><Link to="/stories" className="hover:text-white transition-colors">Siddhesh Stories</Link></li>
                    </ul>
                </div>

                {/* Help Section */}
                <div>
                    <h3 className="text-gray-400 font-semibold mb-4 uppercase text-xs">Help</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/payments" className="hover:text-white transition-colors">Payments</Link></li>
                        <li><Link to="/shipping" className="hover:text-white transition-colors">Shipping</Link></li>
                        <li><Link to="/cancellation" className="hover:text-white transition-colors">Cancellation & Returns</Link></li>
                        <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                    </ul>
                </div>

                {/* Policy Section */}
                <div>
                    <h3 className="text-gray-400 font-semibold mb-4 uppercase text-xs">Policy</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/return-policy" className="hover:text-white transition-colors">Return Policy</Link></li>
                        <li><Link to="/terms" className="hover:text-white transition-colors">Terms Of Use</Link></li>
                        <li><Link to="/privacy" className="hover:text-white transition-colors">Security & Privacy</Link></li>
                    </ul>
                </div>

                {/* Contact Section */}
                <div className="lg:border-l lg:border-gray-700 lg:pl-8">
                    <h3 className="text-gray-400 font-semibold mb-4 uppercase text-xs">Mail Us:</h3>
                    <div className="space-y-3 text-sm">
                        <p className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>
                                Siddhesh Telecome Services,<br />
                                Lavthalswar, Oppo. Anandi Hospital,<br />
                                Jejuri, Tal-Purandhar, Dist-Pune,<br />
                                Maharashtra, India
                            </span>
                        </p>
                        <p className="flex items-center gap-2 mt-4">
                            <Phone className="w-4 h-4 shrink-0" />
                            <span>+91 9822521992 / 9923777771</span>
                        </p>
                        <p className="flex items-center gap-2">
                            <Mail className="w-4 h-4 shrink-0" />
                            <span>sidheshtelecom2@gmail.com</span>
                        </p>
                    </div>

                    <h3 className="text-gray-400 font-semibold mt-6 mb-3 uppercase text-xs">Social:</h3>
                    <div className="flex gap-4">
                        <a href="https://wa.me/919822521992" target="_blank" rel="noopener noreferrer" className="hover:text-[#25D366] transition-colors">
                            {/* Simple WhatsApp SVG Icon */}
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.614-.087-.112-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.082 19.165s-.014 0-.02 0c-1.571 0-3.116-.423-4.469-1.222l-4.976 1.305 1.33-4.851c-.881-1.411-1.346-3.04-1.345-4.707 0-4.985 4.053-9.043 9.035-9.043 2.414.001 4.685.944 6.393 2.653 1.708 1.708 2.649 3.98 2.649 6.394 0 4.983-4.053 9.043-9.034 9.043z" /></svg>
                        </a>
                        <a
                            href="https://www.instagram.com/new_siddhesh_telecom?utm_source=ig_web_button_share_sheet&cplk=ZDNlZDc0MzIxNw=="
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Siddhesh Telecom Services (@new_siddhesh_telecom)"
                            className="hover:text-[#E1306C] transition-colors"
                        >
                            <Instagram className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-700 py-6">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                        <span className="flex items-center gap-2">
                            <span className="text-yellow-500 text-lg">★</span> Become a Seller
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="text-blue-500 text-lg">⭐</span> Advertise
                        </span>
                        <span>© 2026 SiddheshTelecome.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Dummy payment icons */}
                        <div className="flex space-x-2">
                            <div className="w-8 h-5 bg-white rounded flex items-center justify-center text-[8px] font-bold text-blue-800">VISA</div>
                            <div className="w-8 h-5 bg-white rounded flex items-center justify-center text-[8px] font-bold text-red-600">MC</div>
                            <div className="w-8 h-5 bg-white rounded flex items-center justify-center text-[8px] font-bold text-blue-500">AMEX</div>
                            <div className="w-8 h-5 bg-white rounded flex items-center justify-center text-[8px] font-bold text-green-600">RuPay</div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
