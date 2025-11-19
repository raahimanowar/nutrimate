'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useUserInfo } from '@/lib/context/UserContext';

interface FormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface ValidationErrors {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

interface PasswordStrength {
    hasLength: boolean;
    hasUpper: boolean;
    hasLower: boolean;
    hasSpecial: boolean;
}

const SignupPage = () => {
    const router = useRouter();
    const { fetchUserInfo } = useUserInfo();
    const [formData, setFormData] = useState<FormData>({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState<ValidationErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [signupSuccess, setSignupSuccess] = useState(false);

    // Password strength checker
    const checkPasswordStrength = (pwd: string): PasswordStrength => ({
        hasLength: pwd.length >= 8,
        hasUpper: /[A-Z]/.test(pwd),
        hasLower: /[a-z]/.test(pwd),
        hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
    });

    const passwordStrength = checkPasswordStrength(formData.password);
    const isPasswordValid = Object.values(passwordStrength).every((v) => v);

    const isEmailValid = (email: string): boolean =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (formData.username.trim().length < 2) {
            newErrors.username = 'Username must be at least 2 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!isEmailValid(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (!isPasswordValid) {
            newErrors.password =
                'Password must be at least 8 characters with uppercase, lowercase, and special character';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
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
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`, {
                username: formData.username,
                email: formData.email,
                password: formData.password,
            });

            if (response.data.success && response.data.data.token) {
                localStorage.setItem('authToken', response.data.data.token);
                
                // Fetch user info after successful registration
                await fetchUserInfo();
            }

            setSignupSuccess(true);
            setFormData({
                username: '',
                email: '',
                password: '',
                confirmPassword: '',
            });

            setTimeout(() => router.push('/dashboard'), 1500);
        } catch (error) {
            let errorMessage = 'Network error. Please try again.';
            if (error instanceof Error && 'response' in error) {
                const axiosError = error as { response?: { data?: { message?: string } } };
                errorMessage = axiosError.response?.data?.message || errorMessage;
            }
            setErrors({ username: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

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
                        Start Your
                        <br />
                        <span className="bg-linear-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
                            Sustainable Journey
                        </span>
                    </h1>

                    <p className="text-gray-700 text-lg max-w-md mb-10 leading-relaxed">
                        Join NutriMATE and take control of your food habits.
                        Track your meals, manage your inventory, and reduce waste —
                        all while building sustainable living habits.
                    </p>

                    <ul className="space-y-4 text-gray-700">
                        <li className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-orange-500" />
                            Build conscious food habits.
                        </li>
                        <li className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-orange-500" />
                            Reduce waste & save money.
                        </li>
                        <li className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-orange-500" />
                            Track inventory the smart way.
                        </li>
                    </ul>
                </div>

                {/* RIGHT: SIGNUP FORM */}
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
                            Create an Account
                        </h2>

                        {/* Success message */}
                        {signupSuccess && (
                            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl flex gap-3">
                                <CheckCircle2 className="w-5 h-5 text-orange-600" />
                                <div>
                                    <p className="font-semibold text-orange-900">Sign-up successful!</p>
                                    <p className="text-sm text-orange-700">Check your email for verification.</p>
                                </div>
                            </div>
                        )}

                        {/* FORM */}
                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* USERNAME */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="johndoe"
                                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none backdrop-blur-sm transition-all ${
                                        errors.username
                                            ? 'border-red-300 bg-red-50/30 focus:ring-2 focus:ring-red-500/30'
                                            : 'border-white/40 bg-white/30 focus:ring-2 focus:ring-orange-500/30'
                                    }`}
                                />
                                {errors.username && (
                                    <p className="text-red-600 text-sm mt-2 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" /> {errors.username}
                                    </p>
                                )}
                            </div>

                            {/* EMAIL */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
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

                                {/* Password Strength */}
                                {formData.password && (
                                    <div className="mt-3">
                                        <p className="text-xs font-semibold text-gray-600 mb-2">Password requirements:</p>
                                        <div className="space-y-1 text-sm">

                                            <StrengthItem label="At least 8 characters" active={passwordStrength.hasLength} />
                                            <StrengthItem label="Uppercase letter" active={passwordStrength.hasUpper} />
                                            <StrengthItem label="Lowercase letter" active={passwordStrength.hasLower} />
                                            <StrengthItem label="Special character (!@#$%^&*)" active={passwordStrength.hasSpecial} />

                                        </div>
                                    </div>
                                )}

                                {errors.password && (
                                    <p className="text-red-600 text-sm mt-2 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" /> {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* CONFIRM PASSWORD */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Confirm Password
                                </label>

                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className={`w-full px-4 py-3 pr-12 rounded-xl border focus:outline-none backdrop-blur-sm transition-all ${
                                            errors.confirmPassword
                                                ? 'border-red-300 bg-red-50/30 focus:ring-2 focus:ring-red-500/30'
                                                : 'border-white/40 bg-white/30 focus:ring-2 focus:ring-orange-500/30'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                                    >
                                        {showConfirmPassword ? <EyeOff /> : <Eye />}
                                    </button>
                                </div>

                                {errors.confirmPassword && (
                                    <p className="text-red-600 text-sm mt-2 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" /> {errors.confirmPassword}
                                    </p>
                                )}
                            </div>

                            {/* SUBMIT */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full mt-6 bg-linear-to-r from-orange-500 to-amber-600 text-white font-bold py-3 px-4 rounded-xl 
                                hover:shadow-lg hover:shadow-orange-500/40 transition-all duration-300 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Creating Account...' : 'Create Account'}
                            </button>

                            {/* Terms */}
                            <p className="text-xs text-center text-gray-600 mt-4">
                                By signing up, you agree to our{" "}
                                <Link href="#" className="text-orange-600 font-semibold">
                                    Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link href="#" className="text-orange-600 font-semibold">
                                    Privacy Policy
                                </Link>
                            </p>
                        </form>

                        <div className="mt-8 pt-6 border-t border-white/40 text-center">
                            <p className="text-gray-600">
                                Already have an account?{" "}
                                <Link href="/login" className="text-orange-600 font-semibold">
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

// Strength Requirement Item
const StrengthItem = ({ label, active }: { label: string; active: boolean }) => (
    <div className="flex items-center gap-2">
        {active ? (
            <CheckCircle2 className="w-4 h-4 text-orange-500" />
        ) : (
            <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
        )}
        <span className={active ? "text-orange-600" : "text-gray-500"}>{label}</span>
    </div>
);

export default SignupPage;
