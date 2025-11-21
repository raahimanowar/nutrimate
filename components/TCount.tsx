'use client'
import React, { useEffect, useState, useMemo, useRef } from "react";
import CommunityAnim from "./communityanim";

const TrustedCount = () => {
    // Counter targets
    const stats = useMemo(() => [
        { label: "Active Users", value: 1200 },
        { label: "Food Logs", value: 5400 },
        { label: "Inventory Items Tracked", value: 3200 },
        { label: "Waste Reduced (kg)", value: 850 },
    ], []);

    const [counts, setCounts] = useState(stats.map(() => 0));
    const [hasAnimated, setHasAnimated] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated) {
                    setHasAnimated(true);
                    
                    const intervals = stats.map((stat, index) => {
                        const increment = stat.value / 60; // slower animation for better effect
                        return setInterval(() => {
                            setCounts((prev) => {
                                const updated = [...prev];
                                if (updated[index] < stat.value) {
                                    updated[index] = Math.min(
                                        Math.ceil(updated[index] + increment),
                                        stat.value
                                    );
                                }
                                return updated;
                            });
                        }, 30);
                    });

                    return () => intervals.forEach((i) => clearInterval(i));
                }
            },
            { threshold: 0.2 }
        );

        const current = sectionRef.current;
        if (current) {
            observer.observe(current);
        }

        return () => {
            if (current) {
                observer.unobserve(current);
            }
        };
    }, [hasAnimated, stats]);

    return (
        <section 
            ref={sectionRef}
            className="relative py-32 px-4 overflow-hidden bg-linear-to-b from-orange-50 via-amber-50 to-orange-100"
        >

            {/* Background Decorative Blurs */}
            <div className="absolute top-0 right-20 w-[450px] h-[450px] rounded-full 
                bg-linear-to-br from-orange-200/30 to-amber-100/15 blur-3xl opacity-50"></div>

            <div className="absolute bottom-0 left-20 w-[400px] h-[400px] rounded-full 
                bg-linear-to-tr from-orange-200/25 to-amber-100/10 blur-3xl opacity-40"></div>

            <div className="relative max-w-7xl mx-auto">
                <div className="mb-16 space-y-6 text-center">
                    <h2 className="text-4xl sm:text-5xl font-black text-gray-900">
                        Trusted by a Growing Community
                    </h2>

                    <p className="text-gray-700 mt-3 max-w-xl mx-auto text-lg">
                        Empowering users to live sustainably and reduce food waste — together.
                    </p>
                </div>

                {/* Content Grid - Animation + Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    
                    {/* Left - Animation */}
                    <div className="flex justify-center">
                        <div className="w-full max-w-md">
                            <CommunityAnim />
                        </div>
                    </div>

                    {/* Right - Animated Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {stats.map((stat, i) => (
                            <div
                                key={i}
                                className="group p-8 rounded-2xl backdrop-blur-xl bg-white/40 border border-white/50
                                hover:bg-white/60 hover:border-white/70 transition-all duration-300
                                shadow-lg hover:shadow-xl hover:shadow-orange-200/30"
                            >
                                {/* Count Number */}
                                <div className="text-5xl font-extrabold 
                                    bg-linear-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
                                    {counts[i]}
                                    {stat.label.includes("kg") ? "" : "+"}
                                </div>

                                {/* Label */}
                                <p className="text-gray-700 font-medium mt-4">
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TrustedCount;
