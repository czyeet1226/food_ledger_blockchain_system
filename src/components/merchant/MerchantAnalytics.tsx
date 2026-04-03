"use client";

import { useStore } from "@/store";
import { StatCard } from "@/components/ui/Card";

export function MerchantAnalyticsView() {
  const { currentUser, plans, transactions, ownedMemberships } = useStore();
  const myPlans = plans.filter((p) => p.merchantId === currentUser?.id);
  const myTx = transactions.filter((t) => t.to === currentUser?.id);
  const myMemberships = ownedMemberships.filter(
    (m) => m.merchantId === currentUser?.id,
  );
  const totalRevenue = myTx
    .filter((t) => t.status === "confirmed")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your Analytics</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Active Plans"
          value={myPlans.filter((p) => p.isActive).length}
        />
        <StatCard
          label="Total Sold"
          value={myPlans.reduce((s, p) => s + p.sold, 0)}
        />
        <StatCard
          label="Active Members"
          value={myMemberships.filter((m) => m.isValid).length}
        />
        <StatCard label="Revenue" value={`${totalRevenue.toFixed(4)} ETH`} />
      </div>
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-semibold mb-3">Plan Performance</h3>
        <div className="space-y-3">
          {myPlans.map((p) => (
            <div key={p.id} className="flex items-center justify-between">
              <div>
                <span className="font-medium">{p.title}</span>
                <span className="text-sm text-gray-500 ml-2">
                  {p.price} ETH
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span>
                  {p.sold}/{p.maxSupply} sold
                </span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-brand-500 h-2 rounded-full"
                    style={{ width: `${(p.sold / p.maxSupply) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
