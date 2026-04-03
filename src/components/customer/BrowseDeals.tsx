"use client";

import { useStore } from "@/store";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ShoppingCart } from "lucide-react";

export function BrowseDeals() {
  const { plans, ads, purchaseMembership, ownedMemberships, currentUser } =
    useStore();
  const activePlans = plans.filter((p) => p.isActive && p.sold < p.maxSupply);
  const owned = new Set(
    ownedMemberships
      .filter((m) => m.customerId === currentUser?.id)
      .map((m) => m.planId),
  );

  return (
    <div>
      {ads.filter((a) => a.isActive).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Featured Deals</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {ads
              .filter((a) => a.isActive)
              .map((ad) => (
                <div
                  key={ad.id}
                  className="bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl p-5"
                >
                  <h4 className="font-semibold text-lg">{ad.title}</h4>
                  <p className="text-sm opacity-90 mt-1">{ad.description}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      <h3 className="text-lg font-semibold mb-3">Available Memberships</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activePlans.map((plan) => (
          <Card key={plan.id}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold">{plan.title}</h4>
                <p className="text-sm text-gray-500">{plan.merchantName}</p>
              </div>
              <span className="text-lg font-bold text-brand-600">
                {plan.price} ETH
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
            <div className="flex flex-wrap gap-1 mb-3">
              {plan.benefits.map((b, i) => (
                <span
                  key={i}
                  className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded"
                >
                  {b}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
              <span>{plan.duration} days</span>
              <span>{plan.maxSupply - plan.sold} remaining</span>
            </div>
            {owned.has(plan.id) ? (
              <Badge variant="green">Owned</Badge>
            ) : (
              <button
                onClick={() => purchaseMembership(plan.id)}
                className="w-full flex items-center justify-center gap-2 bg-brand-500 text-white py-2 rounded-lg text-sm hover:bg-brand-600 transition-colors"
              >
                <ShoppingCart size={16} /> Purchase
              </button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
