"use client";

import { useStore } from "@/store";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";

export function PlatformOversight() {
  const { transactions } = useStore();

  return (
    <Card>
      <h3 className="font-semibold text-gray-900 mb-4">
        Blockchain Transactions
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <th className="pb-3 pr-4">Tx Hash</th>
              <th className="pb-3 pr-4">From</th>
              <th className="pb-3 pr-4">To</th>
              <th className="pb-3 pr-4">Amount</th>
              <th className="pb-3 pr-4">Plan</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-3.5 pr-4">
                  <code className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-mono">
                    {tx.txHash.slice(0, 10)}...
                  </code>
                </td>
                <td className="py-3.5 pr-4">
                  <code className="text-xs font-mono text-gray-500">
                    {tx.from}
                  </code>
                </td>
                <td className="py-3.5 pr-4">
                  <code className="text-xs font-mono text-gray-500">
                    {tx.to}
                  </code>
                </td>
                <td className="py-3.5 pr-4 font-semibold text-gray-900">
                  {tx.amount} ETH
                </td>
                <td className="py-3.5 pr-4 text-gray-600">{tx.planTitle}</td>
                <td className="py-3.5 pr-4">
                  <StatusBadge status={tx.status} />
                </td>
                <td className="py-3.5 text-gray-400 text-xs">
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
