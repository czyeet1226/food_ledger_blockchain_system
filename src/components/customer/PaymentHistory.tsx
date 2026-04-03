"use client";

import { useStore } from "@/store";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";

export function PaymentHistory() {
  const { transactions, currentUser } = useStore();
  const myTx = transactions.filter(
    (t) => t.from === currentUser?.walletAddress,
  );

  return (
    <Card>
      <h3 className="font-semibold mb-4">Payment History</h3>
      {myTx.length === 0 ? (
        <p className="text-gray-500 text-sm">No transactions yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Plan</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2">Tx Hash</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {myTx.map((tx) => (
                <tr key={tx.id} className="border-b last:border-0">
                  <td className="py-3 font-medium">{tx.planTitle}</td>
                  <td className="py-3">{tx.amount} ETH</td>
                  <td className="py-3">
                    <code className="text-xs bg-gray-100 px-1 rounded">
                      {tx.txHash}
                    </code>
                  </td>
                  <td className="py-3">
                    <StatusBadge status={tx.status} />
                  </td>
                  <td className="py-3 text-gray-500">
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
