"use client";

import { useStore } from "@/store";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";

export function PlatformOversight() {
  const { transactions } = useStore();

  return (
    <Card>
      <h3 className="font-semibold mb-4">Blockchain Transactions</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-2">Tx Hash</th>
              <th className="pb-2">From</th>
              <th className="pb-2">To</th>
              <th className="pb-2">Amount</th>
              <th className="pb-2">Plan</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b last:border-0">
                <td className="py-3">
                  <code className="text-xs bg-gray-100 px-1 rounded">
                    {tx.txHash}
                  </code>
                </td>
                <td className="py-3">
                  <code className="text-xs">{tx.from}</code>
                </td>
                <td className="py-3">
                  <code className="text-xs">{tx.to}</code>
                </td>
                <td className="py-3 font-medium">{tx.amount} ETH</td>
                <td className="py-3">{tx.planTitle}</td>
                <td className="py-3">
                  <StatusBadge status={tx.status} />
                </td>
                <td className="py-3 text-gray-500 text-xs">
                  {new Date(tx.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
