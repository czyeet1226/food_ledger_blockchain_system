"use client";

import { useStore } from "@/store";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Check, X, Clock, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

export function MerchantApproval() {
  const {
    pendingMerchantRegistrations,
    approveMerchantOnChain,
    rejectMerchantOnChain,
    isLoading,
    loadPendingMerchants,
  } = useStore();
  const [approving, setApproving] = useState<number | null>(null);
  const [rejecting, setRejecting] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPendingMerchants();
    setRefreshing(false);
  };

  useEffect(() => {
    loadPendingMerchants();
    // Poll every 10 seconds for new registrations
    const interval = setInterval(() => {
      loadPendingMerchants();
    }, 10000);
    return () => clearInterval(interval);
  }, [loadPendingMerchants]);

  const handleApprove = async (registrationId: number, merchant: string) => {
    setApproving(registrationId);
    const success = await approveMerchantOnChain(registrationId);
    setApproving(null);
    if (success) {
      alert(`Merchant ${merchant} approved successfully!`);
    } else {
      alert("Failed to approve merchant. Please try again.");
    }
  };

  const handleReject = async (registrationId: number, merchant: string) => {
    setRejecting(registrationId);
    const success = await rejectMerchantOnChain(registrationId);
    setRejecting(null);
    if (success) {
      alert(`Merchant ${merchant} rejected successfully!`);
    } else {
      alert("Failed to reject merchant. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-between">
          <span>
            Pending Applications
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({pendingMerchantRegistrations.length})
            </span>
          </span>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>
        </h3>
        {pendingMerchantRegistrations.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check size={20} className="text-green-500" />
            </div>
            <p className="text-gray-500 text-sm">No pending applications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingMerchantRegistrations.map((reg) => (
              <div
                key={reg.id}
                className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">
                        {reg.name}
                      </h4>
                      <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full flex items-center gap-1">
                        <Clock size={12} />
                        Pending
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Wallet:{" "}
                      <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">
                        {reg.merchant}
                      </code>
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Requested:{" "}
                      {new Date(reg.requestedAt * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4 shrink-0">
                    <button
                      onClick={() => handleApprove(reg.id, reg.name)}
                      disabled={
                        approving === reg.id ||
                        rejecting === reg.id ||
                        isLoading
                      }
                      className="flex items-center gap-1.5 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {approving === reg.id ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          Approving...
                        </>
                      ) : (
                        <>
                          <Check size={14} /> Approve
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleReject(reg.id, reg.name)}
                      disabled={
                        approving === reg.id ||
                        rejecting === reg.id ||
                        isLoading
                      }
                      className="flex items-center gap-1.5 bg-white text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {rejecting === reg.id ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
                          Rejecting...
                        </>
                      ) : (
                        <>
                          <X size={14} /> Reject
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
