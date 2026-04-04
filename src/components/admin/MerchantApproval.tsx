"use client";

import { useStore } from "@/store";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Check, X, MapPin, Mail, UtensilsCrossed } from "lucide-react";

export function MerchantApproval() {
  const { merchants, approveMerchant, rejectMerchant } = useStore();
  const pending = merchants.filter((m) => m.status === "pending");
  const reviewed = merchants.filter((m) => m.status !== "pending");

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">
          Pending Applications
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({pending.length})
          </span>
        </h3>
        {pending.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check size={20} className="text-green-500" />
            </div>
            <p className="text-gray-500 text-sm">No pending applications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((m) => (
              <div
                key={m.id}
                className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {m.businessName}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {m.description}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <UtensilsCrossed size={12} />
                        {m.cuisine}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {m.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail size={12} />
                        {m.email}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4 shrink-0">
                    <button
                      onClick={() => approveMerchant(m.id)}
                      className="flex items-center gap-1.5 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm"
                    >
                      <Check size={14} /> Approve
                    </button>
                    <button
                      onClick={() => rejectMerchant(m.id)}
                      className="flex items-center gap-1.5 bg-white text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">
          Reviewed
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({reviewed.length})
          </span>
        </h3>
        <div className="divide-y divide-gray-50">
          {reviewed.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-3">
              <div>
                <span className="font-medium text-gray-900">
                  {m.businessName}
                </span>
                <span className="text-sm text-gray-400 ml-2">{m.cuisine}</span>
              </div>
              <StatusBadge status={m.status} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
