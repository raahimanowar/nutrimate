import React from "react";
import {
    UserPlus,
    ClipboardList,
    Refrigerator,
    LineChart,
    ArrowRight
} from "lucide-react";

const HowToStart = () => {
    const steps = [
        {
            icon: UserPlus,
            title: "Create Your Profile",
            desc: "Add your name, dietary preferences, household size, and goals for sustainable living.",
            color: "from-orange-500 to-amber-600",
            bg: "from-orange-400/20 to-amber-300/10"
        },
        {
            icon: ClipboardList,
            title: "Log Your Daily Consumption",
            desc: "Record what you eat to build awareness and track patterns that influence waste.",
            color: "from-orange-600 to-amber-500",
            bg: "from-orange-400/20 to-amber-300/10"
        },
        {
            icon: Refrigerator,
            title: "Manage Your Inventory",
            desc: "Add items, track quantities, and reduce spoilage with a simple and smart inventory system.",
            color: "from-orange-500 to-amber-600",
            bg: "from-orange-400/20 to-amber-300/10"
        },
        {
            icon: LineChart,
            title: "Review Insights",
            desc: "Get simple, rule-based recommendations to reduce waste and boost sustainability.",
            color: "from-orange-400 to-amber-500",
            bg: "from-orange-300/20 to-amber-200/10"
        }
    ];

    return (
        <section className="relative py-32 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-orange-100 via-amber-50 to-white overflow-hidden">

            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-[450px] h-[450px] rounded-full 
                bg-linear-to-br from-orange-200/30 to-amber-100/15 blur-3xl opacity-50"></div>

            <div className="absolute bottom-20 right-0 w-[500px] h-[500px] rounded-full 
                bg-linear-to-tr from-orange-100/25 to-amber-50/8 blur-3xl opacity-40"></div>

            <div className="relative max-w-7xl mx-auto">

                {/* Header */}
                <div className="text-center mb-20 space-y-6">
                    <h2 className="text-5xl sm:text-6xl font-black text-gray-900 leading-tight">
                        Start Your Journey
                        <br />
                        <span className="bg-linear-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">
                            Toward Sustainable Living
                        </span>
                    </h2>

                    <p className="text-gray-700 max-w-2xl mx-auto text-lg leading-relaxed">
                        Begin your transformation by taking small, meaningful steps. Our platform guides you through 
                        mindful tracking, smart inventory, and sustainable habits aligned with your goals.
                    </p>
                </div>

                {/* Steps Grid - 4 Column Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <div
                                key={index}
                                className="relative group rounded-2xl p-8 backdrop-blur-xl bg-white/40 
                                border border-white/50 hover:bg-white/60 hover:border-white/70 
                                shadow-lg hover:shadow-xl hover:shadow-orange-200/30 transition-all duration-300"
                            >
                                {/* Hover Glow Background */}
                                <div className={`absolute inset-0 rounded-2xl bg-linear-to-br ${step.bg} 
                                    opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                                {/* Content */}
                                <div className="relative z-10 space-y-4">
                                    {/* Icon */}
                                    <div className={`w-14 h-14 flex items-center justify-center rounded-xl 
                                        bg-linear-to-r ${step.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className="w-7 h-7" />
                                    </div>

                                    {/* Title */}
                                    <h4 className="text-xl font-bold text-gray-900">
                                        {step.title}
                                    </h4>

                                    {/* Description */}
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        {step.desc}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* CTA Section */}
                <div className="mt-20 text-center border-t border-white/40 pt-16">
                    <p className="text-gray-700 text-lg mb-8 font-medium">
                        Ready to take the first step toward food sustainability?
                    </p>

                    <button className="inline-flex items-center justify-center gap-2 px-10 py-4 
                        bg-black text-white font-bold rounded-full 
                        shadow-lg hover:shadow-xl hover:shadow-black/40 transition-all duration-300 
                        hover:-translate-y-1 active:translate-y-0">
                        Get Started Now
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default HowToStart;
