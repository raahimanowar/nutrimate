'use client';

import React from 'react';
import Link from 'next/link';
import { useUserInfo } from '@/lib/context/UserContext';

const Navbar = () => {
    const { isAuthenticated, user, clearUser } = useUserInfo();

    const handleLogout = () => {
        clearUser();
        window.location.href = '/';
    };

    return (
        <nav className="fixed z-50 top-5 left-1/2 transform -translate-x-1/2 backdrop-blur-xl bg-white/80 border border-white/40 shadow-lg w-[85%] max-w-6xl rounded-2xl px-8 py-3 transition-all duration-300 hover:bg-white/90 hover:border-white/60">
            <div className="flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="group flex items-center gap-1">
                    <div className="text-2xl font-black italic bg-linear-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
                        NutriMATE
                    </div>
                </Link>

                {/* Navigation Links - Hidden on Mobile */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="#services" className="text-gray-700 hover:text-orange-600 font-medium transition-colors duration-200 text-sm">
                        Services
                    </Link>
                    <Link href="#pricing" className="text-gray-700 hover:text-orange-600 font-medium transition-colors duration-200 text-sm">
                        Pricing
                    </Link>
                    <Link href="#about" className="text-gray-700 hover:text-orange-600 font-medium transition-colors duration-200 text-sm">
                        About
                    </Link>
                    <Link href="#contact" className="text-gray-700 hover:text-orange-600 font-medium transition-colors duration-200 text-sm">
                        Contact
                    </Link>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-4">
                    {isAuthenticated && user ? (
                        <>
                            {/* User logged in - Show Dashboard and Logout */}
                            <span className="hidden sm:block text-gray-700 font-medium text-sm">
                                Welcome, {user.username}!
                            </span>
                            <Link href="/dashboard" className="hidden sm:flex items-center gap-2 bg-linear-to-r from-orange-500 to-amber-600 text-white px-6 py-2 rounded-full hover:shadow-lg hover:shadow-orange-500/40 transition-all duration-300 font-semibold text-sm">
                                Dashboard
                            </Link>
                            <button onClick={handleLogout} className="text-gray-700 hover:text-red-600 font-medium transition-colors duration-200 text-sm">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            {/* User not logged in - Show Login and Get Started */}
                            <Link href="/login" className="hidden sm:block text-gray-700 hover:text-orange-600 font-medium transition-colors duration-200 text-sm">
                                Login
                            </Link>
                            <Link href="/signup" className="flex items-center gap-2 bg-linear-to-r from-orange-500 to-amber-600 text-white px-6 py-2 rounded-full hover:shadow-lg hover:shadow-orange-500/40 transition-all duration-300 font-semibold text-sm">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;