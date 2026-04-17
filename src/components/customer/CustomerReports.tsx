"use client";

import { useStore } from "@/store";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AlertCircle, CheckCircle, Clock, MessageSquare } from "lucide-react";

export function CustomerReports() {
  const { disputes, currentUser } = useStore();

  // Filter disputes for current customer
  const myDisputes = disputes.filter(
    (d) =>
      d.customerId === currentUser?.id ||
      d.customerWalletAddress === currentUser?.walletAddress,
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle size={16} className="text-yellow-500" />;
      case "investigating":
        return <Clock size={16} className="text-blue-500" />;
      case "resolved":
        return <CheckCircle size={16} className="text-green-500" />;
      case "dismissed":
        return <AlertCircle size={16} className="text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "yellow";
      case "investigating":
        return "blue";
      case "resolved":
        return "green";
      case "dismissed":
        return "gray";
      default:
        return "gray";
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        My Reports
        <span className="ml-2 text-sm font-normal text-gray-400">
          ({myDisputes.length})
        </span>
      </h3>
      {myDisputes.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-500">No reports yet</p>
          <p className="text-sm text-gray-400 mt-1">
            If you encounter any issues, you can report them from your
            memberships
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {myDisputes.map((dispute) => (
            <Card
              key={dispute.id}
              className="hover:shadow-card-hover transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">
                      {dispute.subject}
                    </h4>
                    <Badge variant={getStatusColor(dispute.status) as any}>
                      {formatStatus(dispute.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    Against: <strong>{dispute.merchantName}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  {getStatusIcon(dispute.status)}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <p className="text-sm text-gray-700 line-clamp-2">
                  {dispute.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                <div>
                  <span className="font-medium text-gray-600">Reported:</span>
                  {new Date(dispute.createdAt).toLocaleDateString()}
                </div>
                {dispute.resolvedAt && (
                  <div>
                    <span className="font-medium text-gray-600">Resolved:</span>
                    {new Date(dispute.resolvedAt).toLocaleDateString()}
                  </div>
                )}
                <div className="ml-auto">
                  <span className="font-mono text-gray-400">{dispute.id}</span>
                </div>
              </div>

              {dispute.resolution && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    RESOLUTION
                  </p>
                  <p className="text-sm text-gray-700">{dispute.resolution}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
