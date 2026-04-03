"use client";

import { Tabs } from "@/components/ui/Tabs";
import { BrowseDeals } from "./BrowseDeals";
import { MyMemberships } from "./MyMemberships";
import { PaymentHistory } from "./PaymentHistory";

export function CustomerDashboard() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <Tabs
        tabs={[
          { id: "browse", label: "Browse Deals", content: <BrowseDeals /> },
          {
            id: "memberships",
            label: "My Memberships",
            content: <MyMemberships />,
          },
          {
            id: "history",
            label: "Payment History",
            content: <PaymentHistory />,
          },
        ]}
      />
    </div>
  );
}
