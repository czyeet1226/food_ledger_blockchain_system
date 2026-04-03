"use client";

import { useStore } from "@/store";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";

export function UserManagement() {
  const { merchants, customers } = useStore();

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="font-semibold mb-4">Merchants ({merchants.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Business</th>
                <th className="pb-2">Email</th>
                <th className="pb-2">Cuisine</th>
                <th className="pb-2">Location</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Joined</th>
              </tr>
            </thead>
            <tbody>
              {merchants.map((m) => (
                <tr key={m.id} className="border-b last:border-0">
                  <td className="py-3 font-medium">{m.businessName}</td>
                  <td className="py-3 text-gray-600">{m.email}</td>
                  <td className="py-3">{m.cuisine}</td>
                  <td className="py-3 text-gray-600">{m.location}</td>
                  <td className="py-3">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="py-3 text-gray-500">{m.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card>
        <h3 className="font-semibold mb-4">Customers ({customers.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Name</th>
                <th className="pb-2">Email</th>
                <th className="pb-2">Wallet</th>
                <th className="pb-2">Memberships</th>
                <th className="pb-2">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="py-3 font-medium">{c.name}</td>
                  <td className="py-3 text-gray-600">{c.email}</td>
                  <td className="py-3">
                    <code className="text-xs bg-gray-100 px-1 rounded">
                      {c.walletAddress}
                    </code>
                  </td>
                  <td className="py-3">{c.ownedMemberships.length}</td>
                  <td className="py-3 text-gray-500">{c.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
