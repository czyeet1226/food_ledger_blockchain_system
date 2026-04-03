"use client";

import { useStore } from "@/store";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Check, X } from "lucide-react";

export function MerchantApproval() {
  const { merchants, approveMerchant, rejectMerchant } = useStore();
  const pending = merchants.filter((m) => m.status === "pending");
  const reviewed = merchants.filter((m) => m.status !== "pending");

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="font-semibold mb-4">
          Pending Applications ({pending.length})
        </h3>
        {pending.length === 0 ? (
          <p className="text-gray-500 text-sm">No pending applications</p>
        ) : (
          <div className="space-y-4">
            {pending.map((m) => (
              <div
                key={m.id}
                className="border rounded-lg p-4 flex items-start justify-between"
              >
                <div>
                  <h4 className="font-medium">{m.businessName}</h4>
                  <p className="text-sm text-gray-600">{m.description}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>{m.cuisine}</span>
                    <span>{m.location}</span>
                    <span>{m.email}</span>
                    <span>Applied: {m.createdAt}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => approveMerchant(m.id)}
                    className="flex items-center gap-1 bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-600 transition-colors"
                  >
                    <Check size={14} /> Approve
                  </button>
                  <button
                    onClick={() => rejectMerchant(m.id)}
                    className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-600 transition-colors"
                  >
                    <X size={14} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card>
        <h3 className="font-semibold mb-4">Reviewed ({reviewed.length})</h3>
        <div className="space-y-2">
          {reviewed.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between border-b last:border-0 py-2"
            >
              <div>
                <span className="font-medium">{m.businessName}</span>
                <span className="text-sm text-gray-500 ml-2">{m.cuisine}</span>
              </div>
              <StatusBadge status={m.status} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
