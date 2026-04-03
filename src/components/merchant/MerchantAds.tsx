"use client";

import { useState } from "react";
import { useStore } from "@/store";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Plus } from "lucide-react";

export function MerchantAds() {
  const { currentUser, ads, plans, createAd, toggleAd } = useStore();
  const myAds = ads.filter((a) => a.merchantId === currentUser?.id);
  const myPlans = plans.filter((p) => p.merchantId === currentUser?.id);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", planId: "" });

  const handleCreate = () => {
    if (!currentUser) return;
    createAd({
      merchantId: currentUser.id,
      title: form.title,
      description: form.description,
      imageUrl: "",
      planId: form.planId,
      isActive: true,
    });
    setShowCreate(false);
    setForm({ title: "", description: "", planId: "" });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Advertisements</h3>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1 bg-brand-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-600"
        >
          <Plus size={16} /> Create Ad
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {myAds.map((ad) => (
          <Card key={ad.id}>
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold">{ad.title}</h4>
              <Badge variant={ad.isActive ? "green" : "gray"}>
                {ad.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-3">{ad.description}</p>
            <p className="text-xs text-gray-400 mb-3">
              Created: {ad.createdAt}
            </p>
            <button
              onClick={() => toggleAd(ad.id)}
              className={`text-sm px-3 py-1 rounded-lg ${ad.isActive ? "bg-gray-100 text-gray-600" : "bg-brand-500 text-white"}`}
            >
              {ad.isActive ? "Deactivate" : "Activate"}
            </button>
          </Card>
        ))}
      </div>

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Advertisement"
      >
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Ad Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border rounded-lg p-2 text-sm"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border rounded-lg p-2 text-sm"
            rows={2}
          />
          <select
            value={form.planId}
            onChange={(e) => setForm({ ...form, planId: e.target.value })}
            className="w-full border rounded-lg p-2 text-sm"
          >
            <option value="">Select a plan to promote</option>
            {myPlans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          <button
            onClick={handleCreate}
            className="w-full bg-brand-500 text-white py-2 rounded-lg text-sm hover:bg-brand-600"
          >
            Create Ad
          </button>
        </div>
      </Modal>
    </>
  );
}
