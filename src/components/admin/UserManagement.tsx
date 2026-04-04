"use client";

import { useStore } from "@/store";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";

export function UserManagement() {
  const { merchants, customers } = useStore();

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">
          Merchants
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({merchants.length})
          </span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="pb-3 pr-4">Business</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Cuisine</th>
                <th className="pb-3 pr-4">Location</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {merchants.map((m) => (
                <tr
                  key={m.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-3.5 pr-4 font-medium text-gray-900">
                    {m.businessName}
                  </td>
                  <td className="py-3.5 pr-4 text-gray-500">{m.email}</td>
                  <td className="py-3.5 pr-4 text-gray-600">{m.cuisine}</td>
                  <td className="py-3.5 pr-4 text-gray-500">{m.location}</td>
                  <td className="py-3.5 pr-4">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="py-3.5 text-gray-400">{m.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">
          Customers
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({customers.length})
          </span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Wallet</th>
                <th className="pb-3 pr-4">Memberships</th>
                <th className="pb-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-3.5 pr-4 font-medium text-gray-900">
                    {c.name}
                  </td>
                  <td className="py-3.5 pr-4 text-gray-500">{c.email}</td>
                  <td className="py-3.5 pr-4">
                    <code className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-mono">
                      {c.walletAddress}
                    </code>
                  </td>
                  <td className="py-3.5 pr-4 text-gray-600">
                    {c.ownedMemberships.length}
                  </td>
                  <td className="py-3.5 text-gray-400">{c.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
