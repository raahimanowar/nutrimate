'use client'
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
    question: string;
    answer: string;
}

const FAQ: React.FC = () => {
    const faqs: FAQItem[] = [
        {
            question: "How does the food logging system work?",
            answer:
                "You can manually log your daily food usage by entering item names, quantities, and categories. This helps track your consumption patterns over time."
        },
        {
            question: "Can I track my inventory in real-time?",
            answer:
                "Yes! Add items to your inventory with quantity, category, and expiration dates. Our system helps you stay aware of what’s available and what’s about to expire."
        },
        {
            question: "Are the sustainability recommendations AI-based?",
            answer:
                "Part 1 uses simple rule-based recommendations based on your food logs and inventory categories. Advanced AI features will be introduced in Part 2."
        },
        {
            question: "What kind of resources can I access?",
            answer:
                "You’ll get waste-reduction guides, meal planning tips, nutrition articles, and eco-friendly storage methods — all curated for sustainable living."
        },
        {
            question: "Do I need to upload images for food scanning?",
            answer:
                "Image upload is available, but scanning/AI detection is not required in Part 1. You can upload food labels or receipts for record-keeping."
        }
    ];

    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="relative py-32 px-4 sm:px-6 lg:px-8 
            bg-linear-to-b from-white via-amber-50 to-orange-100 overflow-hidden">

            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-96 h-96 rounded-full 
                bg-linear-to-br from-orange-200/30 to-amber-100/15 blur-3xl opacity-50"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full 
                bg-linear-to-tr from-orange-100/25 to-amber-200/15 blur-3xl opacity-40"></div>

            <div className="relative max-w-4xl mx-auto">

                <div className="text-center mb-16 space-y-6">
                    <h2 className="text-5xl sm:text-6xl font-black text-gray-900 leading-tight">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-gray-700 max-w-2xl mx-auto text-lg">
                        Everything you need to know about using the platform for food sustainability.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq: FAQItem, index: number) => (
                        <div
                            key={index}
                            className="group rounded-2xl backdrop-blur-xl bg-white/40 border border-white/50 
                            shadow-lg hover:shadow-xl hover:shadow-orange-200/30 hover:bg-white/60 hover:border-white/70 transition-all duration-300"
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full flex items-center justify-between px-6 py-5 text-left"
                            >
                                <span className="text-lg font-semibold text-gray-900">
                                    {faq.question}
                                </span>
                                <ChevronDown
                                    className={`w-5 h-5 text-orange-600 transition-transform duration-300 ${
                                        openIndex === index ? "rotate-180" : ""
                                    }`}
                                />
                            </button>

                            {openIndex === index && (
                                <div className="px-6 pb-6 text-gray-700 text-sm leading-relaxed border-t border-white/30">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default FAQ;
