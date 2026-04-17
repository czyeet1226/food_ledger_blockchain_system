"use client";

import { useEffect } from "react";
import { useStore } from "@/store";
import { Tabs } from "@/components/ui/Tabs";
import { BrowseDeals } from "./BrowseDeals";
import { MyMemberships } from "./MyMemberships";
import { PaymentHistory } from "./PaymentHistory";
import { CustomerReports } from "./CustomerReports";
import { ShoppingBag, CreditCard, Receipt, AlertTriangle } from "lucide-react";

export function CustomerDashboard() {
  const { loadDisputesFromChain } = useStore();

  useEffect(() => {
    loadDisputesFromChain();
  }, [loadDisputesFromChain]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-sm text-gray-500 mt-1">
          Browse deals and manage your memberships
        </p>
      </div>
      <Tabs
        tabs={[
          {
            id: "browse",
            label: "Browse Deals",
            icon: <ShoppingBag size={16} />,
            content: <BrowseDeals />,
          },
          {
            id: "memberships",
            label: "My Memberships",
            icon: <CreditCard size={16} />,
            content: <MyMemberships />,
          },
          {
            id: "payments",
            label: "Payments",
            icon: <Receipt size={16} />,
            content: <PaymentHistory />,
          },
          {
            id: "reports",
            label: "Reports",
            icon: <AlertTriangle size={16} />,
            content: <CustomerReports />,
          },
        ]}
      />
    </div>
  );
}
