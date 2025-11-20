"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bell, Search, User, ChevronDown, LogOut, Settings, HelpCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useUserInfo } from "@/lib/context/UserContext";

const DashboardNavbar = () => {
  const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const { user, clearUser } = useUserInfo();
  const router = useRouter();

  const handleLogout = () => {
    clearUser();
    router.push('/login');
  };

  return (
    <nav className="fixed top-0 right-0 left-72 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-30 shadow-sm">
      {/* Left Section - Search */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <Separator orientation="vertical" className="h-6 mx-4" />

      {/* Right Section - Notifications and Profile */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all group"
          >
            <Bell className="w-5 h-5 group-hover:text-orange-600 transition-colors" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Notification Dropdown */}
          {isNotificationOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-40">
              <div className="p-4 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">Notifications</p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {[
                  { title: "Reminder", desc: "Time to log your breakfast!" },
                  { title: "Milestone", desc: "You've logged 50 food items!" },
                  { title: "Tip", desc: "Check out our new sustainability tips" },
                ].map((notif, idx) => (
                  <div key={idx} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer last:border-b-0">
                    <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{notif.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all group"
          >
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-orange-500 to-amber-600 flex items-center justify-center overflow-hidden">
              {user?.profilePic ? (
                <img 
                  src={user.profilePic} 
                  alt="Profile" 
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.username || 'User'}</p>
              <p className="text-xs text-gray-500">{user?.role || 'user'}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-orange-600 transition-colors" />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-40">
              <div className="p-4 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">{user?.email || 'Account'}</p>
                <p className="text-xs text-gray-500 mt-1">{user?.username || 'User'}</p>
              </div>
              <div className="py-2">
                <button 
                  onClick={() => {
                    router.push('/dashboard/profile');
                    setIsProfileOpen(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left transition-colors flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Profile Settings
                </button>
                <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left transition-colors flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Help & Support
                </button>
              </div>
              <Separator />
              <button 
                onClick={handleLogout}
                className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left transition-colors font-medium flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
