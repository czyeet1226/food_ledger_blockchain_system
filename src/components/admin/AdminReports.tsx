"use client";

import { useStore } from "@/store";
import { StatCard } from "@/components/ui/Card";

export function AdminReports() {
  const { merchants, customers, transactions, disputes, plans } = useStore();
  const totalRevenue = transactions
    .filter((t) => t.status === "confirmed")
    .reduce((s, t) => s + t.amount, 0);
  const pendingApprovals = merchants.filter(
    (m) => m.status === "pending",
  ).length;
  const activeDisputes = disputes.filter(
    (d) => d.status === "open" || d.status === "investigating",
  ).length;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Platform Analytics</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Merchants" value={merchants.length} />
        <StatCard label="Total Customers" value={customers.length} />
        <StatCard label="Total Transactions" value={transactions.length} />
        <StatCard
          label="Total Revenue"
          value={`${totalRevenue.toFixed(4)} ETH`}
        />
        <StatCard
          label="Active Plans"
          value={plans.filter((p) => p.isActive).length}
        />
        <StatCard
          label="Memberships Sold"
          value={plans.reduce((s, p) => s + p.sold, 0)}
        />
        <StatCard
          label="Pending Approvals"
          value={pendingApprovals}
          sub={pendingApprovals > 0 ? "Needs attention" : "All clear"}
        />
        <StatCard
          label="Active Disputes"
          value={activeDisputes}
          sub={activeDisputes > 0 ? "Needs attention" : "All clear"}
        />
      </div>
    </div>
  );
}
