"use client";

import { useState } from "react";
import { useStore } from "@/store";
import { Card } from "@/components/ui/Card";
import { CheckCircle, XCircle, ScanLine } from "lucide-react";

export function QRVerification() {
  const { ownedMemberships, currentUser } = useStore();
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{
    valid: boolean;
    message: string;
    details?: string;
  } | null>(null);

  const handleVerify = () => {
    const membership = ownedMemberships.find(
      (m) =>
        m.id === input.trim() && m.merchantId === currentUser?.id && m.isValid,
    );
    if (membership) {
      const isExpired = new Date(membership.expiryDate) < new Date();
      setResult(
        isExpired
          ? {
              valid: false,
              message: "Membership expired",
              details: `Expired on ${membership.expiryDate}`,
            }
          : {
              valid: true,
              message: "Valid membership",
              details: `${membership.planTitle} — Expires ${membership.expiryDate}`,
            },
      );
    } else {
      setResult({
        valid: false,
        message: "Invalid membership",
        details: "No matching active membership found",
      });
    }
  };

  return (
    <Card className="max-w-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
          <ScanLine size={20} className="text-brand-500" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">QR Code Verification</h3>
          <p className="text-xs text-gray-500">
            Verify customer membership status
          </p>
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter membership ID (e.g., om-1)"
          className="flex-1 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 outline-none transition-all"
        />
        <button
          onClick={handleVerify}
          className="bg-brand-500 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-brand-600 transition-colors shadow-sm"
        >
          Verify
        </button>
      </div>
      {result && (
        <div
          className={`flex items-start gap-3 p-4 rounded-xl ${
            result.valid
              ? "bg-emerald-50 border border-emerald-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          {result.valid ? (
            <CheckCircle className="text-emerald-500 shrink-0" size={22} />
          ) : (
            <XCircle className="text-red-500 shrink-0" size={22} />
          )}
          <div>
            <p
              className={`font-medium ${result.valid ? "text-emerald-700" : "text-red-700"}`}
            >
              {result.message}
            </p>
            {result.details && (
              <p className="text-sm text-gray-600 mt-0.5">{result.details}</p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
