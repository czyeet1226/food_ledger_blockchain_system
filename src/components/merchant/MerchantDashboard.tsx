"use client";

import { Tabs } from "@/components/ui/Tabs";
import { MerchantAnalyticsView } from "./MerchantAnalytics";
import { ProfileManagement } from "./ProfileManagement";
import { MembershipPlans } from "./MembershipPlans";
import { MerchantAds } from "./MerchantAds";
import { MerchantAnnouncements } from "./MerchantAnnouncements";
import { QRVerification } from "./QRVerification";

export function MerchantDashboard() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <Tabs
        tabs={[
          {
            id: "analytics",
            label: "Analytics",
            content: <MerchantAnalyticsView />,
          },
          { id: "profile", label: "Profile", content: <ProfileManagement /> },
          {
            id: "plans",
            label: "Membership Plans",
            content: <MembershipPlans />,
          },
          { id: "ads", label: "Advertisements", content: <MerchantAds /> },
          {
            id: "announcements",
            label: "Announcements",
            content: <MerchantAnnouncements />,
          },
          { id: "qr", label: "QR Verification", content: <QRVerification /> },
        ]}
      />
    </div>
  );
}
