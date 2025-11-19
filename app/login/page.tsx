'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { useUserInfo } from '@/lib/context/UserContext';

interface FormData {
    email: string;
    password: string;
    rememberMe: boolean;
}

interface ValidationErrors {
    email?: string;
    password?: string;
}

const LoginPage = () => {
    const router = useRouter();
    const { fetchUserInfo } = useUserInfo();
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
        rememberMe: false,
    });

    const [errors, setErrors] = useState<ValidationErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loginSuccess, setLoginSuccess] = useState(false);

    const isEmailValid = (email: string): boolean =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!isEmailValid(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signin`, {
                identifier: formData.email,
                password: formData.password,
            });

            if (response.data.success && response.data.data.token) {
                localStorage.setItem('authToken', response.data.data.token);
                if (formData.rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                }
                
                // Fetch user info after successful login
                await fetchUserInfo();
            }

            setLoginSuccess(true);
            setFormData({
                email: '',
                password: '',
                rememberMe: false,
            });

            setTimeout(() => router.push('/dashboard'), 1500);
        } catch (error) {
            let errorMessage = 'Login failed. Please try again.';
            if (error instanceof Error && 'response' in error) {
                const axiosError = error as { response?: { data?: { message?: string } } };
                errorMessage = axiosError.response?.data?.message || errorMessage;
            }
            setErrors({ email: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));

        if (errors[name as keyof ValidationErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-orange-100 px-6 py-12 flex items-center justify-center">

            {/* background blobs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-br from-orange-200/40 to-amber-100/15 rounded-full blur-3xl opacity-60"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-linear-to-tr from-orange-200/30 to-amber-100/10 rounded-full blur-3xl opacity-50"></div>

            {/* GRID WRAPPER */}
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-16 w-full max-w-7xl">

                {/* LEFT SIDE CONTENT */}
                <div className="flex flex-col justify-center text-left">
                    <h1 className="text-5xl font-black text-gray-900 leading-tight mb-6">
                        Welcome Back to
                        <br />
                        <span className="bg-linear-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
                            NutriMATE
                        </span>
                    </h1>

                    <p className="text-gray-700 text-lg max-w-md mb-10 leading-relaxed">
                        Continue tracking your meals, managing your inventory, 
                        and building sustainable habits with our intelligent food management platform.
                    </p>

                    <ul className="space-y-4 text-gray-700">
                        <li className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-orange-500" />
                            Access your personal dashboard.
                        </li>
                        <li className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-orange-500" />
                            View your sustainability progress.
                        </li>
                        <li className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-orange-500" />
                            Sync across all your devices.
                        </li>
                    </ul>
                </div>

                {/* RIGHT: LOGIN FORM */}
                <div className="relative w-full">
                    {/* Navigation */}
                    <div className="mb-8 flex items-center justify-end">
                        <Link href="/" className="text-orange-600 hover:text-orange-700 font-medium">
                            ← Back to Home
                        </Link>
                    </div>

                    {/* Card */}
                    <div className="backdrop-blur-xl bg-white/50 rounded-3xl border border-white/60 shadow-xl p-8 md:p-10">

                        {/* Header */}
                        <h2 className="text-3xl font-black text-gray-900 mb-3">
                            Sign In
                        </h2>

                        {/* Success message */}
                        {loginSuccess && (
                            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl flex gap-3">
                                <CheckCircle2 className="w-5 h-5 text-orange-600" />
                                <div>
                                    <p className="font-semibold text-orange-900">Sign-in successful!</p>
                                    <p className="text-sm text-orange-700">Redirecting to dashboard...</p>
                                </div>
                            </div>
                        )}

                        {/* FORM */}
                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* EMAIL */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none backdrop-blur-sm transition-all ${
                                        errors.email
                                            ? 'border-red-300 bg-red-50/30 focus:ring-2 focus:ring-red-500/30'
                                            : 'border-white/40 bg-white/30 focus:ring-2 focus:ring-orange-500/30'
                                    }`}
                                />
                                {errors.email && (
                                    <p className="text-red-600 text-sm mt-2 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" /> {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* PASSWORD */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>

                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className={`w-full px-4 py-3 pr-12 rounded-xl border focus:outline-none backdrop-blur-sm transition-all ${
                                            errors.password
                                                ? 'border-red-300 bg-red-50/30 focus:ring-2 focus:ring-red-500/30'
                                                : 'border-white/40 bg-white/30 focus:ring-2 focus:ring-orange-500/30'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                                    >
                                        {showPassword ? <EyeOff /> : <Eye />}
                                    </button>
                                </div>

                                {errors.password && (
                                    <p className="text-red-600 text-sm mt-2 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" /> {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* REMEMBER ME & FORGOT PASSWORD */}
                            <div className="flex items-center justify-between pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="rememberMe"
                                        checked={formData.rememberMe}
                                        onChange={handleChange}
                                        className="w-4 h-4 rounded border-gray-300 accent-orange-500"
                                    />
                                    <span className="text-sm text-gray-700">Remember me</span>
                                </label>
                                <Link href="#" className="text-sm text-orange-600 hover:text-orange-700 font-semibold">
                                    Forgot password?
                                </Link>
                            </div>

                            {/* SUBMIT */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full mt-6 bg-linear-to-r from-orange-500 to-amber-600 text-white font-bold py-3 px-4 rounded-xl 
                                hover:shadow-lg hover:shadow-orange-500/40 transition-all duration-300 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Signing in...' : 'Sign In'}
                            </button>

                            {/* DIVIDER */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white/50 text-gray-600">or</span>
                                </div>
                            </div>

                            {/* SIGN UP LINK */}
                            <p className="text-sm text-center text-gray-600">
                                Don&apos;t have an account?{" "}
                                <Link href="/signup" className="text-orange-600 font-semibold hover:text-orange-700">
                                    Create one now
                                </Link>
                            </p>
                        </form>

                        <div className="mt-8 pt-6 border-t border-white/40 text-center">
                            <p className="text-xs text-gray-500">
                                By signing in, you agree to our{" "}
                                <Link href="#" className="text-orange-600 font-semibold hover:text-orange-700">
                                    Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link href="#" className="text-orange-600 font-semibold hover:text-orange-700">
                                    Privacy Policy
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LoginPage;
