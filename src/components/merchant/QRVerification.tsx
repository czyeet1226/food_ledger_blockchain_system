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
              details: `${membership.planTitle} - Expires ${membership.expiryDate}`,
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
      <div className="flex items-center gap-2 mb-4">
        <ScanLine size={24} className="text-brand-500" />
        <h3 className="font-semibold text-lg">QR Code Verification</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Enter or scan a customer membership ID to verify their membership
        status.
      </p>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter membership ID (e.g., om-1)"
          className="flex-1 border rounded-lg p-2 text-sm"
        />
        <button
          onClick={handleVerify}
          className="bg-brand-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-600"
        >
          Verify
        </button>
      </div>
      {result && (
        <div
          className={`flex items-start gap-3 p-4 rounded-lg ${result.valid ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
        >
          {result.valid ? (
            <CheckCircle className="text-green-500" size={24} />
          ) : (
            <XCircle className="text-red-500" size={24} />
          )}
          <div>
            <p
              className={`font-medium ${result.valid ? "text-green-700" : "text-red-700"}`}
            >
              {result.message}
            </p>
            {result.details && (
              <p className="text-sm text-gray-600 mt-1">{result.details}</p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
