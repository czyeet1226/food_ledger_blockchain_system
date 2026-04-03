"use client";

import { useStore } from "@/store";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import type { OwnedMembership } from "@/types";
import { QrCode, Shield } from "lucide-react";

export function MyMemberships() {
  const { ownedMemberships, currentUser } = useStore();
  const mine = ownedMemberships.filter((m) => m.customerId === currentUser?.id);
  const [qrMembership, setQrMembership] = useState<OwnedMembership | null>(null);
  const [proofMembership, setProofMembership] = useState<OwnedMembership | null>(null);

  return (
    <>
      <h3 className="text-lg font-semibold mb-4">My Memberships ({mine.length})</h3>
      {mine.length === 0 ? (
        <p className="text-gray-500">No memberships yet. Browse deals to get started.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {mine.map((m) => {
            const isExpired = new Date(m.expiryDate) < new Date();
            return (
              <Card key={m.id}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold">{m.planTitle}</h4>
                    <p className="text-sm text-gray-500">{m.merchantName}</p>
                  </div>
                  <Badge variant={isExpired ? "red" : "green"}>{isExpired ? "Expired" : "Active"}</Badge>
                </div>
                <div className="text-sm text-gray-500 space-y-1 mb-3">
                  <p>Purchased: {new Date(m.purchaseDate).toLocaleDateString()}</p>
                  <p>Expires: {new Date(m.expiryDate).toLocaleDateString()}</p>
                  <p>Token ID: {m.tokenId}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setQrMembership(m)}
                    className="flex items-center gap-1 bg-brand-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-brand-600"
                  >
                    <QrCode size={14} /> Show QR
                  </button>
                  <button
                    onClick={() => setProofMembership(m)}
                    className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-200"
                  >
                    <Shield size={14} /> Proof
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={!!qrMembership} onClose={() => setQrMembership(null)} title="Membership QR Code">
        {qrMembership && (
          <div className="flex flex-col items-center py-4">
            <QRCodeSVG value={qrMembership.id} size={200} />
            <p className="text-sm text-gray-600 mt-4">Show this QR code at {qrMembership.merchantName}</p>
            <p className="text-xs text-gray-400 mt-1">ID: {qrMembership.id}</p>
          </div>
        )}
      </Modal>

      <Modal open={!!proofMembership} onClose={() => setProofMembership(null)} title="Cryptographic Proof">
        {proofMembership && (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">Transaction Hash</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded block mt-1 break-all">{proofMembership.txHash}</code>
            </div>
            <div>
              <p className="text-sm font-medium">Token ID</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded block mt-1">{proofMembership.tokenId}</code>
            </div>
            <div>
              <p className="text-sm font-medium">Purchase Date</p>
              <p className="text-sm text-gray-600">{new Date(proofMembership.purchaseDate).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Owner</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded block mt-1">{currentUser?.walletAddress}</code>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              This record is immutable and stored on the blockchain. It can be used as proof of purchase in case of disputes.
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
