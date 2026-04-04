"use client";

import { useStore } from "@/store";
import type { UserRole } from "@/types";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { MerchantDashboard } from "@/components/merchant/MerchantDashboard";
import { CustomerDashboard } from "@/components/customer/CustomerDashboard";
import {
  ShieldCheck,
  Store,
  User,
  LogOut,
  Wallet,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { currentUser, logout } = useStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  if (!currentUser) {
    return <LoginScreen />;
  }

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
  };

  const roleColors: Record<string, string> = {
    admin: "bg-purple-100 text-purple-700",
    merchant: "bg-amber-100 text-amber-700",
    customer: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/60 shadow-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">FL</span>
              </div>
              <span className="font-bold text-lg tracking-tight text-gray-900">
                FoodLedger
              </span>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${roleColors[currentUser.role] || ""}`}
              >
                {currentUser.role}
              </span>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    {currentUser.name.charAt(0)}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">
                    {currentUser.walletAddress.slice(0, 6)}...
                    {currentUser.walletAddress.slice(-4)}
                  </p>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">
                        {currentUser.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {currentUser.email}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <Wallet size={12} className="text-gray-400" />
                        <code className="text-xs text-gray-500 font-mono">
                          {currentUser.walletAddress.slice(0, 6)}...
                          {currentUser.walletAddress.slice(-4)}
                        </code>
                      </div>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} /> Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="animate-fade-in">
        {currentUser.role === "admin" && <AdminDashboard />}
        {currentUser.role === "merchant" && <MerchantDashboard />}
        {currentUser.role === "customer" && <CustomerDashboard />}
      </main>
    </div>
  );
}

function LoginScreen() {
  const { isWalletConnected, walletAddress, connectWallet, loginWithRole } =
    useStore();
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    await connectWallet();
    setConnecting(false);
  };

  const roles: {
    role: UserRole;
    label: string;
    desc: string;
    icon: React.ReactNode;
    gradient: string;
    iconBg: string;
  }[] = [
    {
      role: "admin",
      label: "Admin",
      desc: "Platform governance & oversight",
      icon: <ShieldCheck size={28} />,
      gradient: "from-purple-500 to-purple-600",
      iconBg: "bg-purple-100 text-purple-600",
    },
    {
      role: "merchant",
      label: "Merchant",
      desc: "Create & sell memberships",
      icon: <Store size={28} />,
      gradient: "from-amber-500 to-orange-500",
      iconBg: "bg-amber-100 text-amber-600",
    },
    {
      role: "customer",
      label: "Customer",
      desc: "Browse & purchase memberships",
      icon: <User size={28} />,
      gradient: "from-blue-500 to-cyan-500",
      iconBg: "bg-blue-100 text-blue-600",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-brand-50/30 to-gray-100 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-300/20 rounded-full blur-3xl" />
      </div>

      <div className="text-center relative z-10 px-4 animate-slide-up">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-14 h-14 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/25">
            <span className="text-white font-bold text-2xl">FL</span>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          FoodLedger
        </h1>
        <p className="text-gray-500 mt-2 mb-10 text-lg">
          Blockchain-powered restaurant memberships
        </p>

        {!isWalletConnected ? (
          /* Step 1: Connect Wallet */
          <div className="space-y-4">
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:from-brand-600 hover:to-brand-700 transition-all shadow-lg shadow-brand-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Wallet size={24} />
              {connecting ? "Connecting..." : "Connect Wallet"}
            </button>
            <p className="text-sm text-gray-400">
              Connect your MetaMask wallet to get started
            </p>
          </div>
        ) : (
          /* Step 2: Choose Role */
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-8 ring-1 ring-emerald-600/10">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Connected:{" "}
              <code className="font-mono">
                {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
              </code>
            </div>

            <p className="text-gray-600 mb-6 text-sm">
              Choose your role to continue
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {roles.map(({ role, label, desc, icon, gradient, iconBg }) => (
                <button
                  key={role}
                  onClick={() =>
                    walletAddress && loginWithRole(role, walletAddress)
                  }
                  className="bg-white rounded-2xl p-6 w-full sm:w-56 shadow-card hover:shadow-card-hover border border-gray-100 hover:border-gray-200 transition-all duration-200 text-left group hover:-translate-y-1"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${iconBg} group-hover:scale-110 transition-transform duration-200`}
                  >
                    {icon}
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">
                    {label}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {desc}
                  </p>
                  <div
                    className={`mt-4 h-1 w-12 rounded-full bg-gradient-to-r ${gradient} opacity-60 group-hover:w-full group-hover:opacity-100 transition-all duration-300`}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
