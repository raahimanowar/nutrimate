"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    Apple,
    Package,
    Lightbulb,
    BarChart3,
    Users,
    Settings,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const mainMenuItems = [
    { label: "Profile", href: "/dashboard/profile", icon: Settings },
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Daily Log", href: "/dashboard/dailylog", icon: Apple },
    { label: "Inventory", href: "/dashboard/inventory", icon: Package },
    { label: "Insights", href: "/dashboard/insights", icon: BarChart3 },
    { label: "Tips & Resources", href: "/dashboard/tips", icon: Lightbulb },
];

const communityItems = [
    { label: "Family", href: "/dashboard/family", icon: Users },
    { label: "Community", href: "/dashboard/community", icon: Users },
];

// const bottomMenuItems = [

// ];

const Sidebar = () => {
    const pathname = usePathname();
    const [collapsed] = useState(false);

    return (
        <aside
            className={`${collapsed ? "w-20" : "w-72"} sidebar h-screen bg-linear-to-b from-white to-gray-50 border-r border-orange-500/20 px-4 pb-4 flex flex-col gap-6 transition-all duration-300 overflow-y-auto fixed left-0 top-0 z-40`}
        >


            {/* LOGO SECTION */}
            <div className="pt-4 space-y-2.5 sticky top-0 bg-white items-center justify-between px-2">
                <Link href="/" className="group flex items-center gap-1">
                    <div className="text-2xl font-black italic bg-linear-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
                        NutriMATE
                    </div>
                </Link>
                <Separator />
            </div>
            {/* MAIN MENU */}
            <div className="flex-1 space-y-2">
                <p className={`text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 ${collapsed ? "hidden" : ""}`}>
                    Menu
                </p>
                <nav className="space-y-1">
                    {mainMenuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${isActive
                                    ? "bg-linear-to-r from-orange-500/20 to-amber-500/10 text-orange-600 border border-orange-500/30"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                    }`}
                                title={item.label}
                            >
                                <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-orange-600" : "group-hover:text-orange-600"} transition-colors`} />
                                {!collapsed && <span className="font-medium">{item.label}</span>}
                                {!collapsed && isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-600"></div>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* COMMUNITY SECTION */}
            {!collapsed && (
                <div className="space-y-2 pb-4">
                    <Separator className="mb-4" />
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">
                        Community
                    </p>
                    {communityItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${isActive
                                    ? "bg-linear-to-r from-orange-500/20 to-amber-500/10 text-orange-600 border border-orange-500/30"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* STATS SECTION */}
            {!collapsed && (
                <div className="bg-linear-to-br from-orange-500/10 to-amber-500/5 rounded-2xl p-4 border border-orange-500/20">
                    <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-3">
                        Your Impact
                    </p>
                    <div className="space-y-3">
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-700">Waste Reduced</span>
                                <span className="text-sm font-bold text-orange-600">12.5 kg</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div className="h-full bg-linear-to-r from-orange-500 to-amber-500 w-[65%]"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-700">Items Logged</span>
                                <span className="text-sm font-bold text-orange-600">47</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div className="h-full bg-linear-to-r from-orange-500 to-amber-500 w-[80%]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* BOTTOM MENU */}
            {/* <div className="space-y-1 pt-4">
                <Separator className="mb-4" />
                {bottomMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${isActive
                                ? "bg-linear-to-r from-orange-500/20 to-amber-500/10 text-orange-600"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                }`}
                            title={item.label}
                        >
                            <Icon className="w-5 h-5 shrink-0" />
                            {!collapsed && <span className="font-medium">{item.label}</span>}
                        </Link>
                    );
                })}
            </div> */}
        </aside>
    );
};

export default Sidebar;
