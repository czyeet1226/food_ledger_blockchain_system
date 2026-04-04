"use client";

import { useStore } from "@/store";
import { StatCard } from "@/components/ui/Card";
import {
  Users,
  Store,
  ArrowRightLeft,
  Coins,
  LayoutGrid,
  ShoppingBag,
  Clock,
  AlertCircle,
} from "lucide-react";

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
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Merchants"
          value={merchants.length}
          icon={<Store size={20} />}
        />
        <StatCard
          label="Total Customers"
          value={customers.length}
          icon={<Users size={20} />}
        />
        <StatCard
          label="Transactions"
          value={transactions.length}
          icon={<ArrowRightLeft size={20} />}
        />
        <StatCard
          label="Total Revenue"
          value={`${totalRevenue.toFixed(4)} ETH`}
          icon={<Coins size={20} />}
        />
        <StatCard
          label="Active Plans"
          value={plans.filter((p) => p.isActive).length}
          icon={<LayoutGrid size={20} />}
        />
        <StatCard
          label="Memberships Sold"
          value={plans.reduce((s, p) => s + p.sold, 0)}
          icon={<ShoppingBag size={20} />}
        />
        <StatCard
          label="Pending Approvals"
          value={pendingApprovals}
          sub={pendingApprovals > 0 ? "Needs attention" : "All clear"}
          icon={<Clock size={20} />}
        />
        <StatCard
          label="Active Disputes"
          value={activeDisputes}
          sub={activeDisputes > 0 ? "Needs attention" : "All clear"}
          icon={<AlertCircle size={20} />}
        />
      </div>
    </div>
  );
}
