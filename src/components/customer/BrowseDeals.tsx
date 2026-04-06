"use client";

import { useEffect } from "react";
import { useStore } from "@/store";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ShoppingCart, Sparkles } from "lucide-react";

export function BrowseDeals() {
  const { plans, ads, purchaseMembership, ownedMemberships, currentUser, loadPlansFromBlockchain } =
    useStore();

  // Load plans from blockchain on component mount
  useEffect(() => {
    loadPlansFromBlockchain();
  }, [loadPlansFromBlockchain]);

  const activePlans = plans.filter((p) => p.isActive && p.sold < p.maxSupply);
  const owned = new Set(
    ownedMemberships
      .filter((m) => m.customerId === currentUser?.id)
      .map((m) => m.planId),
  );

  return (
    <div className="space-y-8">
      {ads.filter((a) => a.isActive).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500" /> Featured Deals
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {ads
              .filter((a) => a.isActive)
              .map((ad) => (
                <div
                  key={ad.id}
                  className="bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-2xl p-6 shadow-lg shadow-brand-500/20"
                >
                  <h4 className="font-semibold text-lg">{ad.title}</h4>
                  <p className="text-sm opacity-90 mt-1.5">{ad.description}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Available Memberships
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activePlans.map((plan) => (
            <Card
              key={plan.id}
              className="hover:shadow-card-hover transition-all duration-200 flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{plan.title}</h4>
                  <p className="text-sm text-gray-400">{plan.merchantName}</p>
                </div>
                <span className="text-lg font-bold text-brand-600">
                  {plan.price} ETH
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-3">{plan.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {plan.benefits.map((b, i) => (
                  <span
                    key={i}
                    className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-lg"
                  >
                    {b}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm text-gray-400 mb-4 mt-auto">
                <span>{plan.duration} days</span>
                <span>{plan.maxSupply - plan.sold} remaining</span>
              </div>
              {owned.has(plan.id) ? (
                <Badge variant="green">Owned</Badge>
              ) : (
                <button
                  onClick={() => purchaseMembership(plan.id)}
                  className="w-full flex items-center justify-center gap-2 bg-brand-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-brand-600 transition-colors shadow-sm"
                >
                  <ShoppingCart size={16} /> Purchase
                </button>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
