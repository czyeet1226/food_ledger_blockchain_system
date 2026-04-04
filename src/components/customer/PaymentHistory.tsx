"use client";

import { useStore } from "@/store";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Receipt } from "lucide-react";

export function PaymentHistory() {
  const { transactions, currentUser } = useStore();
  const myTx = transactions.filter(
    (t) => t.from === currentUser?.walletAddress,
  );

  return (
    <Card>
      <h3 className="font-semibold text-gray-900 mb-4">Payment History</h3>
      {myTx.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Receipt size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-500">No transactions yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="pb-3 pr-4">Plan</th>
                <th className="pb-3 pr-4">Amount</th>
                <th className="pb-3 pr-4">Tx Hash</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {myTx.map((tx) => (
                <tr
                  key={tx.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-3.5 pr-4 font-medium text-gray-900">
                    {tx.planTitle}
                  </td>
                  <td className="py-3.5 pr-4 font-semibold text-gray-900">
                    {tx.amount} ETH
                  </td>
                  <td className="py-3.5 pr-4">
                    <code className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-mono">
                      {tx.txHash.slice(0, 10)}...
                    </code>
                  </td>
                  <td className="py-3.5 pr-4">
                    <StatusBadge status={tx.status} />
                  </td>
                  <td className="py-3.5 text-gray-400">
                    {new Date(tx.timestamp).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
