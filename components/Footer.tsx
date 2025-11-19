import React from 'react';
import { ArrowRight, Leaf, Users, Zap, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="relative bg-linear-to-b from-gray-950 to-black text-white overflow-hidden">
            {/* Subtle accent elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-br from-orange-500/8 to-amber-500/4 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-linear-to-tr from-orange-600/8 to-amber-500/4 rounded-full blur-3xl"></div>

            <div className="relative">
                {/* Main Footer Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                        
                        {/* Brand Section */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-3xl font-black bg-linear-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent mb-2">
                                    NutriMATE
                                </h3>
                                <p className="text-gray-400 text-sm">Smart food tracking for sustainable living</p>
                            </div>
                            
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Reduce waste, nourish communities, and build sustainable eating habits with intelligent food management.
                            </p>

                            {/* Social Links */}
                            <div className="flex gap-3">
                                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-orange-600 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-orange-600/50">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7"></path></svg>
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-orange-600 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-orange-600/50">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path fill="black" d="M16.5 12.5a4 4 0 11-8 0 4 4 0 018 0zM18.5 7.5a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-orange-600 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-orange-600/50">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.39v-1.2h-2.5v8.5h2.5v-4.34c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.34h2.5M6.5 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm.5 2h-1v8.5h1V10z"></path></svg>
                                </a>
                            </div>
                        </div>

                        {/* Product Links */}
                        <div>
                            <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-orange-400" />
                                Product
                            </h4>
                            <ul className="space-y-3">
                                <li><Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">Features</Link></li>
                                <li><Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">Pricing</Link></li>
                                <li><Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">Dashboard</Link></li>
                                <li><Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">Mobile App</Link></li>
                                <li><Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">API Docs</Link></li>
                            </ul>
                        </div>

                        {/* Company Links */}
                        <div>
                            <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Users className="w-5 h-5 text-orange-400" />
                                Company
                            </h4>
                            <ul className="space-y-3">
                                <li><Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">About Us</Link></li>
                                <li><Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">Blog</Link></li>
                                <li><Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">Career</Link></li>
                                <li><Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">Press</Link></li>
                                <li><Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">Partners</Link></li>
                            </ul>
                        </div>

                        {/* Newsletter & Contact */}
                        <div>
                            <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Leaf className="w-5 h-5 text-orange-400" />
                                Stay Updated
                            </h4>
                            <p className="text-gray-400 text-sm mb-4">Get tips and updates on sustainable living</p>
                            
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        placeholder="Your email"
                                        className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                                    />
                                    <button className="px-4 py-2 bg-linear-to-r from-orange-500 to-amber-600 text-white rounded-lg hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300">
                                        <Mail className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Contact Info */}
                                <div className="space-y-2 pt-4 border-t border-gray-800">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Phone className="w-4 h-4 text-orange-400" />
                                        <span className="text-gray-400">+1 (555) 123-4567</span>
                                    </div>
                                    <div className="flex items-start gap-3 text-sm">
                                        <MapPin className="w-4 h-4 text-orange-400 mt-1 shrink-0" />
                                        <span className="text-gray-400">San Francisco, CA 94105</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-800"></div>

                    {/* Bottom Section */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 mt-12">
                        {/* Left - Legal Links */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-400">
                            <Link href="#" className="hover:text-orange-400 transition-colors duration-200">Privacy Policy</Link>
                            <Link href="#" className="hover:text-orange-400 transition-colors duration-200">Terms of Service</Link>
                            <Link href="#" className="hover:text-orange-400 transition-colors duration-200">Cookie Policy</Link>
                            <Link href="#" className="hover:text-orange-400 transition-colors duration-200">Sitemap</Link>
                        </div>

                        {/* Right - Copyright & CTA */}
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <p className="text-gray-500 text-sm text-center">
                                © 2024 NutriMATE. All rights reserved. • Made for sustainability 🌱
                            </p>
                            <button className="inline-flex items-center gap-2 px-6 py-2 bg-linear-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300 hover:-translate-y-0.5 whitespace-nowrap">
                                Join Now
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;