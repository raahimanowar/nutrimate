"use client";

import React from "react";
import {
    ArrowRight,
    Zap,
    Target,
    BookOpen,
    Briefcase
} from "lucide-react";
import FoodAnim from "./FoodAnim";
import FoodAnim2 from "./FoodAnim2";

const Banner = () => {
    return (
        <section className="relative overflow-hidden bg-linear-to-br from-orange-50 via-amber-50 to-orange-100 pb-20 px-4 sm:px-6 lg:px-8 pt-48">

            {/* Soft Gradient Blurs */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-linear-to-br from-orange-200 via-amber-100 to-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

            <div
                className="absolute -top-40 left-20 w-96 h-96 bg-linear-to-br from-orange-200 to-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-15"
            ></div>

            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-linear-to-tr from-orange-200 to-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-15"></div>

            <div className="relative max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                    {/* LEFT CONTENT */}
                    <div className="space-y-8 pt-8 lg:pt-0">

                        <div className="space-y-6">
                            <h1 className="text-5xl sm:text-7xl font-black text-gray-900 leading-tight">
                                Smart tracking,
                                <br />
                                <span className="bg-linear-to-r from-orange-300 to-amber-600 bg-clip-text text-transparent">
                                    sustainable living.
                                </span>
                            </h1>
                            <p className="text-lg text-gray-700 max-w-lg leading-relaxed">
                                Track your food consumption, manage inventory intelligently, and reduce waste while building sustainable habits that matter.
                            </p>
                        </div>

                        {/* CTA Button */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-linear-to-r from-orange-500 to-amber-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 hover:-translate-y-1 active:translate-y-0">
                                Start Tracking
                                <ArrowRight className="w-5 h-5" />
                            </button>
                            <button className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-black bg-black text-white font-bold rounded-full hover:bg-gray-900 transition-all duration-300">
                                Learn More
                            </button>
                        </div>

                    </div>
                    <div className="absolute left-272 -top-48 w-80 h-80 opacity-60 hidden lg:block z-10">
                        <FoodAnim2 />
                    </div>
                    {/* RIGHT CARD */}
                    <div className="z-11 group">

                        {/* Soft Glow */}
                        <div className="absolute -inset-1 bg-linear-to-br from-orange-300/30 via-amber-200/10 to-transparent rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 transition-all duration-300" />

                        {/* Roadmap Card */}
                        <div className="relative backdrop-blur-xl bg-white/40 rounded-3xl overflow-hidden border border-white/50 p-8 md:p-10 shadow-xl hover:shadow-2xl hover:shadow-orange-200/40 transition-all duration-300 group-hover:border-orange-300/70 group-hover:bg-white/60">

                            {/* Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-3xl font-bold bg-linear-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                                        Your Journey Roadmap
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Reduce waste & build sustainable habits
                                    </p>
                                </div>

                                <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-full bg-orange-400/20 border border-orange-400/40 group-hover:bg-orange-400/30 transition-all">
                                    <Target className="w-7 h-7 text-orange-600" />
                                </div>
                            </div>


                            {/* GRID STEPS */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                                {[
                                    {
                                        icon: Zap,
                                        title: "Track",
                                        desc: "Log your daily food habits to build awareness.",
                                        color: "from-orange-400 to-amber-500"
                                    },
                                    {
                                        icon: Target,
                                        title: "Analyze",
                                        desc: "Review your inventory & get reduction insights.",
                                        color: "from-orange-600 to-amber-700"
                                    },
                                    {
                                        icon: BookOpen,
                                        title: "Learn",
                                        desc: "Access tailored waste-reduction resources.",
                                        color: "from-orange-500 to-amber-600"
                                    },
                                    {
                                        icon: Briefcase,
                                        title: "Improve",
                                        desc: "Apply habits to reduce weekly food waste.",
                                        color: "from-orange-400 to-amber-500"
                                    },
                                ].map((step, idx) => {
                                    const Icon = step.icon;
                                    return (
                                        <div
                                            key={idx}
                                            className="flex gap-3 p-4 rounded-xl bg-white/40 backdrop-blur-lg border border-white/50 hover:bg-white/60 shadow-md transition-all duration-300 cursor-pointer"
                                        >
                                            <div className={`w-10 h-10 flex items-center justify-center rounded-full 
                                                bg-linear-to-br ${step.color} text-white shadow`}>
                                                <Icon className="w-5 h-5" />
                                            </div>

                                            <div className="flex-1">
                                                <h4 className="font-semibold text-orange-700 text-sm">{step.title}</h4>
                                                <p className="text-xs text-gray-700 leading-relaxed">{step.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Footer */}
                            <div className="mt-8 pt-6 border-t border-white/50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
                                    <span className="text-xs font-medium text-orange-700">
                                        Your journey begins here
                                    </span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-orange-700 group-hover:translate-x-1 transition-transform" />
                            </div>

                        </div>

                        {/* Animation */}
                        <div className="absolute right-130 -bottom-28 w-80 h-80 opacity-80 hidden lg:block">
                            <FoodAnim />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Banner;
