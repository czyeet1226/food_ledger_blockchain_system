"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import type { Dispute, DisputeStatus } from "@/types";
import { User, Store } from "lucide-react";

export function DisputeResolution() {
  const { disputes, updateDisputeStatus, loadDisputesFromChain } = useStore();
  const [selected, setSelected] = useState<Dispute | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load disputes from blockchain when component mounts
  useEffect(() => {
    const loadDisputes = async () => {
      setIsLoading(true);
      await loadDisputesFromChain();
      setIsLoading(false);
    };
    loadDisputes();
  }, [loadDisputesFromChain]);

  const handleResolve = async (status: DisputeStatus) => {
    if (!selected) return;
    try {
      await updateDisputeStatus(selected.id, status);
      setSelected(null);
      alert("Dispute status updated successfully!");
    } catch (err) {
      console.error("Error updating dispute:", err);
      alert("Failed to update dispute status");
    }
  };

  return (
    <>
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">
          Disputes
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({disputes.length})
          </span>
        </h3>
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading disputes from blockchain...</p>
          </div>
        ) : disputes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No disputes yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Reported issues will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {disputes.map((d: Dispute) => (
              <div
                key={d.id}
                className="border border-gray-100 rounded-xl p-5 cursor-pointer hover:border-brand-200 hover:bg-brand-50/30 transition-all"
                onClick={() => setSelected(d)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setSelected(d)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{d.subject}</h4>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {d.description}
                    </p>
                    <div className="flex gap-4 mt-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {d.customerName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Store size={12} />
                        {d.merchantName}
                      </span>
                      <span>Filed: {d.createdAt}</span>
                    </div>
                  </div>
                  <StatusBadge status={d.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Resolve Dispute"
      >
        {selected && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subject
              </p>
              <p className="text-sm text-gray-900 mt-1">{selected.subject}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {selected.description}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </p>
                <p className="text-sm text-gray-900 mt-1">
                  {selected.customerName}
                </p>
                <code className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md block mt-1.5 font-mono break-all">
                  {selected.customerWalletAddress}
                </code>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Merchant
                </p>
                <p className="text-sm text-gray-900 mt-1">
                  {selected.merchantName}
                </p>
                <code className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md block mt-1.5 font-mono break-all">
                  {selected.merchantWalletAddress}
                </code>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction
              </p>
              <code className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md block mt-1 font-mono">
                {selected.txHash}
              </code>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleResolve("investigating")}
                className="bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Investigate
              </button>
              <button
                onClick={() => handleResolve("resolved")}
                className="bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors"
              >
                Resolve
              </button>
              <button
                onClick={() => handleResolve("dismissed")}
                className="bg-gray-100 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
