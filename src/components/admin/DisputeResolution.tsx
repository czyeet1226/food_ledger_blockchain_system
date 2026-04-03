"use client";

import { useState } from "react";
import { useStore } from "@/store";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import type { Dispute, DisputeStatus } from "@/types";

export function DisputeResolution() {
  const { disputes, updateDisputeStatus } = useStore();
  const [selected, setSelected] = useState<Dispute | null>(null);
  const [resolution, setResolution] = useState("");

  const handleResolve = (status: DisputeStatus) => {
    if (!selected) return;
    updateDisputeStatus(selected.id, status, resolution);
    setSelected(null);
    setResolution("");
  };

  return (
    <>
      <Card>
        <h3 className="font-semibold mb-4">Disputes ({disputes.length})</h3>
        <div className="space-y-3">
          {disputes.map((d) => (
            <div
              key={d.id}
              className="border rounded-lg p-4 cursor-pointer hover:border-brand-300 transition-colors"
              onClick={() => setSelected(d)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setSelected(d)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{d.subject}</h4>
                  <p className="text-sm text-gray-600 mt-1">{d.description}</p>
                  <div className="flex gap-3 mt-2 text-xs text-gray-500">
                    <span>Customer: {d.customerName}</span>
                    <span>Merchant: {d.merchantName}</span>
                    <span>Filed: {d.createdAt}</span>
                  </div>
                </div>
                <StatusBadge status={d.status} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Resolve Dispute"
      >
        {selected && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">Subject</p>
              <p className="text-sm text-gray-600">{selected.subject}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Description</p>
              <p className="text-sm text-gray-600">{selected.description}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Transaction</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                {selected.txHash}
              </code>
            </div>
            <div>
              <label
                htmlFor="resolution"
                className="text-sm font-medium block mb-1"
              >
                Resolution Notes
              </label>
              <textarea
                id="resolution"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full border rounded-lg p-2 text-sm"
                rows={3}
                placeholder="Enter resolution details..."
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleResolve("investigating")}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600"
              >
                Investigate
              </button>
              <button
                onClick={() => handleResolve("resolved")}
                className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600"
              >
                Resolve
              </button>
              <button
                onClick={() => handleResolve("dismissed")}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600"
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
