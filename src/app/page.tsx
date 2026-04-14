"use client";

import { useStore } from "@/store";
import { Role } from "@/contracts/FoodLedger";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { MerchantDashboard } from "@/components/merchant/MerchantDashboard";
import { PendingApprovalScreen } from "@/components/merchant/PendingApproval";
import { CustomerDashboard } from "@/components/customer/CustomerDashboard";
import {
  Store,
  User,
  LogOut,
  Wallet,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Home() {
  const {
    currentUser,
    logout,
    isWalletConnected,
    walletAddress,
    onChainRole,
    isLoading,
    connectWallet,
    registerOnChain,
    startMerchantApprovalPolling,
    stopMerchantApprovalPolling,
  } = useStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Start polling when merchant is pending
  useEffect(() => {
    if (
      currentUser &&
      currentUser.role === "merchant" &&
      currentUser.status === "pending"
    ) {
      startMerchantApprovalPolling(currentUser.walletAddress);
      return () => {
        stopMerchantApprovalPolling();
      };
    }
  }, [
    currentUser?.role,
    currentUser?.status,
    currentUser?.walletAddress,
    startMerchantApprovalPolling,
    stopMerchantApprovalPolling,
  ]);

  // Step 1: Not connected → show Connect Wallet
  if (!isWalletConnected) {
    return <ConnectScreen />;
  }

  // Step 2: Connected but no role → show Registration
  if (onChainRole === Role.None && !currentUser) {
    return <RegisterScreen />;
  }

  // Step 3: Loading
  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={32} className="animate-spin text-brand-500" />
      </div>
    );
  }

  // Step 4: Merchant waiting for approval
  if (currentUser.role === "merchant" && currentUser.status === "pending") {
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
                          onClick={() => {
                            setShowUserMenu(false);
                            logout();
                          }}
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
          <PendingApprovalScreen />
        </main>
      </div>
    );
  }

  // Step 5: Logged in → show dashboard
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

function ConnectScreen() {
  const { connectWallet, isLoading } = useStore();
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    await connectWallet();
    setConnecting(false);
  };

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
        <button
          onClick={handleConnect}
          disabled={connecting || isLoading}
          className="inline-flex items-center gap-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:from-brand-600 hover:to-brand-700 transition-all shadow-lg shadow-brand-500/25 disabled:opacity-60"
        >
          {connecting || isLoading ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <Wallet size={24} />
          )}
          {connecting || isLoading ? "Connecting..." : "Connect Wallet"}
        </button>
        <p className="text-sm text-gray-400 mt-4">
          Connect your MetaMask wallet to get started
        </p>
      </div>
    </div>
  );
}

function RegisterScreen() {
  const { walletAddress, registerOnChain, isLoading } = useStore();
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<
    "merchant" | "customer" | null
  >(null);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!selectedRole) {
      setError("Please select a role");
      return;
    }
    setError("");
    const success = await registerOnChain(selectedRole, name.trim());
    if (!success) {
      setError(
        "Registration failed. Make sure you're connected to the Hardhat network.",
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-brand-50/30 to-gray-100 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-300/20 rounded-full blur-3xl" />
      </div>
      <div className="text-center relative z-10 px-4 animate-slide-up max-w-md w-full">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-14 h-14 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/25">
            <span className="text-white font-bold text-2xl">FL</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Register
        </h1>

        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mt-4 ring-1 ring-emerald-600/10">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <code className="font-mono">
            {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
          </code>
        </div>

        <p className="text-gray-500 mt-4 mb-6 text-sm">
          This wallet is not registered yet. Choose your role — this is
          permanent and stored on the blockchain.
        </p>

        <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 text-left space-y-4">
          <div>
            <label
              htmlFor="name"
              className="text-sm font-medium text-gray-700 block mb-1.5"
            >
              Your Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name or business name"
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 outline-none transition-all"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Select Role
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedRole("merchant")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedRole === "merchant"
                    ? "border-amber-400 bg-amber-50"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <Store
                  size={24}
                  className={
                    selectedRole === "merchant"
                      ? "text-amber-600"
                      : "text-gray-400"
                  }
                />
                <p className="font-semibold text-gray-900 mt-2">Merchant</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Create & sell memberships
                </p>
              </button>
              <button
                onClick={() => setSelectedRole("customer")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedRole === "customer"
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <User
                  size={24}
                  className={
                    selectedRole === "customer"
                      ? "text-blue-600"
                      : "text-gray-400"
                  }
                />
                <p className="font-semibold text-gray-900 mt-2">Customer</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Browse & buy memberships
                </p>
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            onClick={handleRegister}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-brand-500 text-white py-3 rounded-xl text-sm font-medium hover:bg-brand-600 transition-colors shadow-sm disabled:opacity-60"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
            {isLoading ? "Registering on blockchain..." : "Register"}
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Admin accounts are set during contract deployment
        </p>
      </div>
    </div>
  );
}
