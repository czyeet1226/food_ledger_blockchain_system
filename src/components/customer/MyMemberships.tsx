"use client";

import { useStore } from "@/store";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import type { OwnedMembership } from "@/types";
import { QrCode, Shield, CreditCard } from "lucide-react";

export function MyMemberships() {
  const { ownedMemberships, currentUser } = useStore();
  const mine = ownedMemberships.filter((m) => m.customerId === currentUser?.id);
  const [qrMembership, setQrMembership] = useState<OwnedMembership | null>(
    null,
  );
  const [proofMembership, setProofMembership] =
    useState<OwnedMembership | null>(null);

  return (
    <>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        My Memberships
        <span className="ml-2 text-sm font-normal text-gray-400">
          ({mine.length})
        </span>
      </h3>
      {mine.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CreditCard size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-500">No memberships yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Browse deals to get started
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {mine.map((m) => {
            const isExpired = new Date(m.expiryDate) < new Date();
            return (
              <Card
                key={m.id}
                className="hover:shadow-card-hover transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {m.planTitle}
                    </h4>
                    <p className="text-sm text-gray-400">{m.merchantName}</p>
                  </div>
                  <Badge variant={isExpired ? "red" : "green"}>
                    {isExpired ? "Expired" : "Active"}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500 space-y-1 mb-4">
                  <p>
                    Purchased: {new Date(m.purchaseDate).toLocaleDateString()}
                  </p>
                  <p>Expires: {new Date(m.expiryDate).toLocaleDateString()}</p>
                  <p className="font-mono text-xs text-gray-400">
                    Token: {m.tokenId}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setQrMembership(m)}
                    className="flex items-center gap-1.5 bg-brand-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-600 transition-colors"
                  >
                    <QrCode size={14} /> Show QR
                  </button>
                  <button
                    onClick={() => setProofMembership(m)}
                    className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    <Shield size={14} /> Proof
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={!!qrMembership}
        onClose={() => setQrMembership(null)}
        title="Membership QR Code"
      >
        {qrMembership && (
          <div className="flex flex-col items-center py-6">
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
              <QRCodeSVG value={qrMembership.id} size={200} />
            </div>
            <p className="text-sm text-gray-600 mt-5">
              Show this QR code at {qrMembership.merchantName}
            </p>
            <p className="text-xs text-gray-400 mt-1 font-mono">
              ID: {qrMembership.id}
            </p>
          </div>
        )}
      </Modal>

      <Modal
        open={!!proofMembership}
        onClose={() => setProofMembership(null)}
        title="Cryptographic Proof"
      >
        {proofMembership && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction Hash
              </p>
              <code className="text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg block mt-1.5 break-all font-mono">
                {proofMembership.txHash}
              </code>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Token ID
              </p>
              <code className="text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg block mt-1.5 font-mono">
                {proofMembership.tokenId}
              </code>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Purchase Date
              </p>
              <p className="text-sm text-gray-700 mt-1">
                {new Date(proofMembership.purchaseDate).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Owner
              </p>
              <code className="text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg block mt-1.5 font-mono">
                {currentUser?.walletAddress}
              </code>
            </div>
            <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
              This record is immutable and stored on the blockchain. It serves
              as proof of purchase.
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
