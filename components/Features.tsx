import React from "react";
import {
    Zap,
    Target,
    BookOpen,
    Leaf,
    Camera,
    ClipboardList,
    Refrigerator,
    LineChart
} from "lucide-react";
import { ArrowRight } from "lucide-react";

const Features = () => {
    const features = [
        {
            icon: ClipboardList,
            title: "Food Consumption Logging",
            desc: "Easily log what you eat daily to build awareness and track patterns.",
            color: "from-orange-500 to-amber-600",
            bgColor: "from-orange-400/20 to-amber-300/10"
        },
        {
            icon: Refrigerator,
            title: "Smart Inventory Tracking",
            desc: "Track what's in your kitchen with quantity, dates, and categories.",
            color: "from-orange-600 to-amber-500",
            bgColor: "from-orange-400/20 to-amber-300/10"
        },
        {
            icon: BookOpen,
            title: "Sustainability Resources",
            desc: "Access tips on reducing waste, budget-friendly meals, and proper storage.",
            color: "from-orange-500 to-amber-600",
            bgColor: "from-orange-400/20 to-amber-300/10"
        },
        {
            icon: LineChart,
            title: "Insightful Summaries",
            desc: "See weekly & monthly summaries to understand your food habits.",
            color: "from-orange-400 to-amber-500",
            bgColor: "from-orange-300/20 to-amber-200/10"
        },
        {
            icon: Camera,
            title: "Receipt / Label Upload",
            desc: "Upload food images or receipts (UI-only in Part 1) for future AI scanning.",
            color: "from-orange-600 to-amber-700",
            bgColor: "from-orange-400/20 to-amber-300/10"
        },
        {
            icon: Leaf,
            title: "Eco-Friendly Guidance",
            desc: "Get category-based suggestions for sustainable food management.",
            color: "from-orange-500 to-amber-600",
            bgColor: "from-orange-400/20 to-amber-300/10"
        },
        {
            icon: Zap,
            title: "Simple Rule-Based Tracking",
            desc: "Smart but simple suggestions matched to your logged items.",
            color: "from-orange-400 to-amber-500",
            bgColor: "from-orange-300/20 to-amber-200/10"
        },
        {
            icon: Target,
            title: "Goal-Focused Dashboard",
            desc: "Your personalized hub for logs, inventory, and sustainability goals.",
            color: "from-orange-600 to-amber-700",
            bgColor: "from-orange-400/20 to-amber-300/10"
        },
    ];

    return (
        <section className="relative bg-linear-to-br from-orange-100 via-amber-50 to-orange-50 py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">

            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-linear-to-br from-orange-200/30 to-amber-100/15 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-linear-to-tl from-orange-100/25 to-amber-50/8 rounded-full blur-3xl opacity-40"></div>
            <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-linear-to-tr from-orange-200/15 to-amber-100/8 rounded-full blur-3xl opacity-30"></div>

            <div className="relative max-w-7xl mx-auto">

                {/* Section Header */}
                <div className="text-center mb-20 space-y-6">

                    <h2 className="text-5xl sm:text-6xl font-black text-gray-900 leading-tight">
                        Everything You Need
                        <br />
                        <span className="bg-linear-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">
                            for Smart Living
                        </span>
                    </h2>

                    <p className="text-gray-700 max-w-3xl mx-auto text-lg leading-relaxed">
                        Built for individuals and families who want to reduce food waste,
                        manage inventories intelligently, and build sustainable habits.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                    {features.map((f, i) => {
                        const Icon = f.icon;
                        return (
                            <div
                                key={i}
                                className="group relative overflow-hidden rounded-2xl transition-all duration-300"
                            >
                                {/* Gradient Hover Background */}
                                <div className={`absolute inset-0 bg-linear-to-br ${f.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                                {/* Card */}
                                <div className="relative p-8 rounded-2xl backdrop-blur-xl bg-white/40 border border-white/50 
                                    hover:bg-white/60 hover:border-white/70 shadow-lg hover:shadow-xl hover:shadow-orange-200/30
                                    transition-all duration-300 h-full flex flex-col">

                                    {/* Icon */}
                                    <div className={`w-14 h-14 flex items-center justify-center rounded-xl 
                                        bg-linear-to-br ${f.color} text-white mb-5 
                                        shadow-lg group-hover:scale-110 group-hover:shadow-lg transition-transform duration-300`}>
                                        <Icon className="w-7 h-7" />
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-orange-700 transition-colors duration-300">
                                        {f.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-gray-700 text-sm leading-relaxed grow">
                                        {f.desc}
                                    </p>

                                    {/* Bottom Accent */}
                                    <div className="mt-4 pt-4 border-t border-white/30 flex items-center text-orange-600 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        Learn more →
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom CTA */}
                <div className="mt-20 pt-16 border-t border-white/40 text-center">
                    <p className="text-gray-700 text-lg mb-8 font-medium">
                        Ready to transform your food habits and reduce waste?
                    </p>
                    <button className="inline-flex items-center justify-center gap-2 px-8 py-4 
                        bg-linear-to-r from-orange-500 to-amber-600 text-white font-bold rounded-full 
                        shadow-lg hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 
                        hover:-translate-y-1 active:translate-y-0">
                        Get Started Today
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>

            </div>
        </section>
    );
};

export default Features;
