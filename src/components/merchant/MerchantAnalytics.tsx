"use client";

import { useStore } from "@/store";
import { StatCard } from "@/components/ui/Card";
import { Card } from "@/components/ui/Card";
import { LayoutGrid, ShoppingBag, Users, Coins } from "lucide-react";

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
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Plans"
          value={myPlans.filter((p) => p.isActive).length}
          icon={<LayoutGrid size={20} />}
        />
        <StatCard
          label="Total Sold"
          value={myPlans.reduce((s, p) => s + p.sold, 0)}
          icon={<ShoppingBag size={20} />}
        />
        <StatCard
          label="Active Members"
          value={myMemberships.filter((m) => m.isValid).length}
          icon={<Users size={20} />}
        />
        <StatCard
          label="Revenue"
          value={`${totalRevenue.toFixed(4)} ETH`}
          icon={<Coins size={20} />}
        />
      </div>
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Plan Performance</h3>
        <div className="space-y-4">
          {myPlans.map((p) => (
            <div key={p.id} className="flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-900">{p.title}</span>
                <span className="text-sm text-gray-400 ml-2">
                  {p.price} ETH
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-500">
                  {p.sold}/{p.maxSupply} sold
                </span>
                <div className="w-32 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-brand-400 to-brand-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(p.sold / p.maxSupply) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
