"use client";

import { useStore } from "@/store";
import type { UserRole } from "@/types";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { MerchantDashboard } from "@/components/merchant/MerchantDashboard";
import { CustomerDashboard } from "@/components/customer/CustomerDashboard";
import { ShieldCheck, Store, User, LogOut } from "lucide-react";

export default function Home() {
  const { currentUser, login, logout } = useStore();

  if (!currentUser) {
    return <LoginScreen onLogin={login} />;
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">FL</span>
          </div>
          <span className="font-semibold text-lg">FoodLedger</span>
          <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full ml-2 capitalize">
            {currentUser.role}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{currentUser.name}</span>
          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
            {currentUser.walletAddress}
          </code>
          <button
            onClick={logout}
            className="text-gray-500 hover:text-red-500 transition-colors"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </nav>
      <main>
        {currentUser.role === "admin" && <AdminDashboard />}
        {currentUser.role === "merchant" && <MerchantDashboard />}
        {currentUser.role === "customer" && <CustomerDashboard />}
      </main>
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: (role: UserRole) => void }) {
  const roles: {
    role: UserRole;
    label: string;
    desc: string;
    icon: React.ReactNode;
  }[] = [
    {
      role: "admin",
      label: "Admin",
      desc: "Platform governance & oversight",
      icon: <ShieldCheck size={32} />,
    },
    {
      role: "merchant",
      label: "Merchant",
      desc: "Create & sell memberships",
      icon: <Store size={32} />,
    },
    {
      role: "customer",
      label: "Customer",
      desc: "Browse & purchase memberships",
      icon: <User size={32} />,
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">FL</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">FoodLedger</h1>
        </div>
        <p className="text-gray-600 mb-8">
          Blockchain-powered restaurant memberships
        </p>
        <div className="flex gap-4">
          {roles.map(({ role, label, desc, icon }) => (
            <button
              key={role}
              onClick={() => onLogin(role)}
              className="bg-white rounded-xl p-6 w-52 shadow-sm border border-gray-200 hover:border-brand-400 hover:shadow-md transition-all text-left group"
            >
              <div className="text-brand-500 mb-3 group-hover:scale-110 transition-transform">
                {icon}
              </div>
              <h3 className="font-semibold text-lg mb-1">{label}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
