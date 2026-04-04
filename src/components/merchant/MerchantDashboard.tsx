"use client";

import { Tabs } from "@/components/ui/Tabs";
import { MerchantAnalyticsView } from "./MerchantAnalytics";
import { ProfileManagement } from "./ProfileManagement";
import { MembershipPlans } from "./MembershipPlans";
import { MerchantAds } from "./MerchantAds";
import { MerchantAnnouncements } from "./MerchantAnnouncements";
import { QRVerification } from "./QRVerification";
import {
  BarChart3,
  UserCircle,
  CreditCard,
  Megaphone,
  Bell,
  QrCode,
} from "lucide-react";

export function MerchantDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Merchant Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your restaurant and memberships
        </p>
      </div>
      <Tabs
        tabs={[
          {
            id: "analytics",
            label: "Analytics",
            icon: <BarChart3 size={16} />,
            content: <MerchantAnalyticsView />,
          },
          {
            id: "profile",
            label: "Profile",
            icon: <UserCircle size={16} />,
            content: <ProfileManagement />,
          },
          {
            id: "plans",
            label: "Plans",
            icon: <CreditCard size={16} />,
            content: <MembershipPlans />,
          },
          {
            id: "ads",
            label: "Ads",
            icon: <Megaphone size={16} />,
            content: <MerchantAds />,
          },
          {
            id: "announcements",
            label: "Announcements",
            icon: <Bell size={16} />,
            content: <MerchantAnnouncements />,
          },
          {
            id: "qr",
            label: "QR Verify",
            icon: <QrCode size={16} />,
            content: <QRVerification />,
          },
        ]}
      />
    </div>
  );
}
