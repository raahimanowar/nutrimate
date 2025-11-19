'use client'
import React, { useEffect, useState, useMemo } from "react";

const TrustedCount = () => {
    // Counter targets
    const stats = useMemo(() => [
        { label: "Active Users", value: 1200 },
        { label: "Food Logs", value: 5400 },
        { label: "Inventory Items Tracked", value: 3200 },
        { label: "Waste Reduced (kg)", value: 850 },
    ], []);

    const [counts, setCounts] = useState(stats.map(() => 0));

    useEffect(() => {
        const intervals = stats.map((stat, index) => {
            const increment = stat.value / 100; // speed
            return setInterval(() => {
                setCounts((prev) => {
                    const updated = [...prev];
                    if (updated[index] < stat.value) {
                        updated[index] = Math.ceil(updated[index] + increment);
                    }
                    return updated;
                });
            }, 20);
        });

        return () => intervals.forEach((i) => clearInterval(i));
    }, [stats]);

    return (
        <section className="relative py-32 px-4 overflow-hidden
            bg-linear-to-b from-orange-50 via-amber-50 to-orange-100">

            {/* Background Decorative Blurs */}
            <div className="absolute top-0 right-20 w-[450px] h-[450px] rounded-full 
                bg-linear-to-br from-orange-200/30 to-amber-100/15 blur-3xl opacity-50"></div>

            <div className="absolute bottom-0 left-20 w-[400px] h-[400px] rounded-full 
                bg-linear-to-tr from-orange-200/25 to-amber-100/10 blur-3xl opacity-40"></div>

            <div className="relative max-w-7xl mx-auto text-center">
                <div className="mb-16 space-y-6">
                    <h2 className="text-4xl sm:text-5xl font-black text-gray-900">
                        Trusted by a Growing Community
                    </h2>

                    <p className="text-gray-700 mt-3 max-w-xl mx-auto text-lg">
                        Empowering users to live sustainably and reduce food waste — together.
                    </p>
                </div>

                {/* Animated Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
        </section>
    );
};

export default TrustedCount;
