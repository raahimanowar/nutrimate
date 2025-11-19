import React from "react";
import { Star } from "lucide-react";

const Review = () => {
    const reviews = [
        {
            name: "Ayesha Rahman",
            role: "Home Cook",
            comment:
                "This platform helped me understand my food waste habits. The inventory tracking alone saved me money every month!",
            rating: 5,
            img: "https://i.pravatar.cc/150?img=32"
        },
        {
            name: "Michael Lee",
            role: "Student",
            comment:
                "Super easy to log meals and track what's in my fridge. Highly recommended for anyone trying to live sustainably.",
            rating: 4,
            img: "https://i.pravatar.cc/150?img=12"
        },
        {
            name: "Sophia Hasan",
            role: "Nutrition Enthusiast",
            comment:
                "The insights and sustainability tips are so helpful. I love how everything feels clean, organized, and meaningful.",
            rating: 5,
            img: "https://i.pravatar.cc/150?img=45"
        }
    ];

    return (
        <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white">

            {/* Gradient Fade Overlays - Top & Bottom */}
            <div className="absolute top-0 left-0 right-0 h-40 bg-linear-to-b from-white via-white/50 to-transparent pointer-events-none z-20"></div>
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-linear-to-t from-white via-white/50 to-transparent pointer-events-none z-20"></div>

            {/* Animated Background Pattern */}
            <div className="absolute inset-0">
                {/* Concentric Circles Background */}
                <svg 
                    className="absolute inset-0 w-full h-full" 
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMidYMid slice"
                    viewBox="0 0 1200 1000"
                >
                    <defs>
                        <radialGradient id="circleGrad1" cx="50%" cy="50%">
                            <stop offset="0%" stopColor="#fda95d" stopOpacity="0.6"/>
                            <stop offset="40%" stopColor="#fdba74" stopOpacity="0.3"/>
                            <stop offset="100%" stopColor="#fed7aa" stopOpacity="0"/>
                        </radialGradient>
                        <radialGradient id="circleGrad2" cx="50%" cy="50%">
                            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.5"/>
                            <stop offset="50%" stopColor="#fda95d" stopOpacity="0.2"/>
                            <stop offset="100%" stopColor="#fed7aa" stopOpacity="0"/>
                        </radialGradient>
                        <radialGradient id="circleGrad3" cx="50%" cy="50%">
                            <stop offset="0%" stopColor="#fdba74" stopOpacity="0.4"/>
                            <stop offset="60%" stopColor="#fed7aa" stopOpacity="0.1"/>
                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
                        </radialGradient>
                    </defs>

                    {/* Background */}
                    <rect width="100%" height="100%" fill="#ffffff"/>

                    {/* Large Concentric Circles - Center */}
                    <circle cx="600" cy="500" r="600" fill="url(#circleGrad1)"/>
                    <circle cx="600" cy="500" r="450" fill="url(#circleGrad2)"/>
                    <circle cx="600" cy="500" r="300" fill="url(#circleGrad3)"/>

                    {/* Secondary Circle - Top Left */}
                    <circle cx="250" cy="250" r="350" fill="url(#circleGrad2)" opacity="0.6"/>

                    {/* Secondary Circle - Bottom Right */}
                    <circle cx="950" cy="750" r="400" fill="url(#circleGrad1)" opacity="0.5"/>
                </svg>

                {/* Animated Floating Elements */}
                <div className="absolute top-1/4 left-10 w-72 h-72 bg-linear-to-br from-orange-300/20 to-orange-100/10 rounded-full mix-blend-screen filter blur-3xl animate-float-slow"></div>
                
                <div className="absolute top-1/2 right-20 w-96 h-96 bg-linear-to-tl from-amber-300/15 to-orange-200/5 rounded-full mix-blend-screen filter blur-3xl animate-float-medium" style={{ animationDelay: "1.5s" }}></div>
                
                <div className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-linear-to-tr from-orange-200/15 to-amber-100/5 rounded-full mix-blend-screen filter blur-3xl animate-float-slow" style={{ animationDelay: "3s" }}></div>

                {/* Radial Lines Pattern */}
                <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1000">
                    <defs>
                        <pattern id="radialLines" patternUnits="userSpaceOnUse" width="100" height="100" patternTransform="translate(600,500)">
                            <line x1="0" y1="0" x2="50" y2="0" stroke="#f97316" strokeWidth="0.5"/>
                            <line x1="0" y1="0" x2="35.35" y2="35.35" stroke="#f97316" strokeWidth="0.5"/>
                            <line x1="0" y1="0" x2="0" y2="50" stroke="#f97316" strokeWidth="0.5"/>
                            <line x1="0" y1="0" x2="-35.35" y2="35.35" stroke="#f97316" strokeWidth="0.5"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#radialLines)"/>
                </svg>
            </div>

            <style>{`
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0px) translateX(0px); }
                    50% { transform: translateY(-40px) translateX(15px); }
                }
                
                @keyframes float-medium {
                    0%, 100% { transform: translateY(0px) translateX(0px); }
                    50% { transform: translateY(-30px) translateX(-15px); }
                }
                
                .animate-float-slow {
                    animation: float-slow 10s ease-in-out infinite;
                }
                
                .animate-float-medium {
                    animation: float-medium 12s ease-in-out infinite;
                }
            `}</style>

            <div className="relative max-w-7xl mx-auto">

                {/* Header */}
                <div className="text-center mb-20 space-y-6">
                    <h2 className="text-5xl sm:text-6xl font-black text-gray-900 leading-tight">
                        What People Are Saying
                    </h2>
                    <p className="text-gray-700 max-w-2xl mx-auto text-lg">
                        Real experiences from users who transformed their food habits through smart tracking and sustainable living.
                    </p>
                </div>

                {/* Review Cards - 3 Column Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reviews.map((review, index) => (
                        <div
                            key={index}
                            className="group relative overflow-hidden rounded-2xl transition-all duration-300"
                        >
                            {/* Animated Border Gradient */}
                            <div className="absolute -inset-1 bg-linear-to-r from-orange-400 via-amber-400 to-orange-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur"></div>

                            {/* Card Content */}
                            <div
                                className="relative p-8 rounded-2xl backdrop-blur-lg bg-white/75 
                                border border-white/70 shadow-lg hover:shadow-2xl hover:shadow-orange-300/30
                                hover:bg-white/90 group-hover:border-white/90 transition-all duration-300"
                            >
                                {/* Inner Glow on Hover */}
                                <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-orange-100/0 via-transparent to-orange-50/0 
                                    group-hover:from-orange-100/40 group-hover:to-amber-100/30 transition-all duration-500 pointer-events-none"></div>

                                {/* Avatar Section */}
                                <div className="flex items-center gap-4 mb-6 relative z-10">
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-full bg-linear-to-br from-orange-400 to-amber-500 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-300"></div>
                                        <img
                                            src={review.img}
                                            alt={review.name}
                                            className="relative w-14 h-14 rounded-full border-2 border-orange-200 shadow-md group-hover:scale-110 transition-transform duration-300"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-base">{review.name}</h4>
                                        <p className="text-orange-600 text-sm font-semibold">{review.role}</p>
                                    </div>
                                </div>

                                {/* Quote Icon */}
                                <div className="absolute top-6 right-6 text-orange-300/30 text-6xl font-serif leading-none">
                                    
                                </div>

                                {/* Comment */}
                                <p className="text-gray-700 text-sm leading-relaxed mb-6 relative z-10">
                                    {review.comment}
                                </p>

                                {/* Rating Section */}
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(review.rating)].map((_, i) => (
                                            <Star 
                                                key={i} 
                                                className="w-4 h-4 text-orange-500 fill-orange-500 group-hover:scale-125 transition-transform duration-300" 
                                                style={{ transitionDelay: `${i * 40}ms` }} 
                                            />
                                        ))}
                                        {[...Array(5 - review.rating)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 text-gray-300" />
                                        ))}
                                    </div>
                                    <span className="text-xs font-semibold text-orange-600">({review.rating}.0)</span>
                                </div>

                                {/* Bottom Accent Line */}
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-orange-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Social Proof Section */}
                <div className="mt-24 pt-20 border-t border-orange-200/30">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center space-y-3 group cursor-pointer transform transition-all duration-300 hover:scale-105">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-br from-orange-200/60 to-amber-200/40 group-hover:from-orange-300/70 group-hover:to-amber-300/50 transition-all duration-300 shadow-lg">
                                <span className="text-2xl font-bold text-orange-700">10K</span>
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg">Happy Users</h3>
                            <p className="text-gray-600 text-sm">Transforming food habits daily</p>
                        </div>
                        
                        <div className="text-center space-y-3 group cursor-pointer transform transition-all duration-300 hover:scale-105">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-br from-orange-200/60 to-amber-200/40 group-hover:from-orange-300/70 group-hover:to-amber-300/50 transition-all duration-300 shadow-lg">
                                <span className="text-2xl font-bold text-orange-700">4.9★</span>
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg">Average Rating</h3>
                            <p className="text-gray-600 text-sm">From verified reviews</p>
                        </div>

                        <div className="text-center space-y-3 group cursor-pointer transform transition-all duration-300 hover:scale-105">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-br from-orange-200/60 to-amber-200/40 group-hover:from-orange-300/70 group-hover:to-amber-300/50 transition-all duration-300 shadow-lg">
                                <span className="text-2xl font-bold text-orange-700">50K</span>
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg">Meals Tracked</h3>
                            <p className="text-gray-600 text-sm">Reducing waste together</p>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default Review;