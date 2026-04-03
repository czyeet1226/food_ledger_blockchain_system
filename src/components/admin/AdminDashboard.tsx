"use client";

import { Tabs } from "@/components/ui/Tabs";
import { UserManagement } from "./UserManagement";
import { MerchantApproval } from "./MerchantApproval";
import { AdminReports } from "./AdminReports";
import { PlatformOversight } from "./PlatformOversight";
import { DisputeResolution } from "./DisputeResolution";

export function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <Tabs
        tabs={[
          { id: "overview", label: "Overview", content: <AdminReports /> },
          {
            id: "users",
            label: "User Management",
            content: <UserManagement />,
          },
          {
            id: "approvals",
            label: "Merchant Approval",
            content: <MerchantApproval />,
          },
          {
            id: "oversight",
            label: "Platform Oversight",
            content: <PlatformOversight />,
          },
          { id: "disputes", label: "Disputes", content: <DisputeResolution /> },
        ]}
      />
    </div>
  );
}
