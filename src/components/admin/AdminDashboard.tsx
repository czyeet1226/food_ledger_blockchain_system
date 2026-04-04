"use client";

import { Tabs } from "@/components/ui/Tabs";
import { UserManagement } from "./UserManagement";
import { MerchantApproval } from "./MerchantApproval";
import { AdminReports } from "./AdminReports";
import { PlatformOversight } from "./PlatformOversight";
import { DisputeResolution } from "./DisputeResolution";
import {
  BarChart3,
  Users,
  CheckSquare,
  Eye,
  AlertTriangle,
} from "lucide-react";

export function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your platform</p>
      </div>
      <Tabs
        tabs={[
          {
            id: "overview",
            label: "Overview",
            icon: <BarChart3 size={16} />,
            content: <AdminReports />,
          },
          {
            id: "users",
            label: "Users",
            icon: <Users size={16} />,
            content: <UserManagement />,
          },
          {
            id: "approvals",
            label: "Approvals",
            icon: <CheckSquare size={16} />,
            content: <MerchantApproval />,
          },
          {
            id: "oversight",
            label: "Transactions",
            icon: <Eye size={16} />,
            content: <PlatformOversight />,
          },
          {
            id: "disputes",
            label: "Disputes",
            icon: <AlertTriangle size={16} />,
            content: <DisputeResolution />,
          },
        ]}
      />
    </div>
  );
}
