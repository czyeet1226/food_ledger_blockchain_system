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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
      await createAd({
        merchantId: currentUser.id,
        merchantName: currentUser.name,
        title: form.title,
        description: form.description,
        planId: form.planId,
        isActive: true,
      });
      setShowCreate(false);
      setForm({ title: "", description: "", planId: "" });
    } catch (err) {
      const message =
        (err as { reason?: string })?.reason ||
        (err as { message?: string })?.message ||
        "Unknown error";
      alert(`Failed to create ad: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 outline-none transition-all";

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-gray-900">Advertisements</h3>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 bg-brand-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-600 transition-colors shadow-sm"
        >
          <Plus size={16} /> Create Ad
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {myAds.map((ad) => (
          <Card
            key={ad.id}
            className="hover:shadow-card-hover transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-semibold text-gray-900">{ad.title}</h4>
              <Badge variant={ad.isActive ? "green" : "gray"}>
                {ad.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mb-3">{ad.description}</p>
            <p className="text-xs text-gray-400 mb-4">
              Created: {ad.createdAt}
            </p>
            <button
              onClick={() => toggleAd(ad.id)}
              className={`text-sm px-4 py-2 rounded-xl font-medium transition-colors ${ad.isActive ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-brand-500 text-white hover:bg-brand-600"}`}
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
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Ad Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputClass}
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={inputClass + " resize-none"}
            rows={2}
          />
          <select
            value={form.planId}
            onChange={(e) => setForm({ ...form, planId: e.target.value })}
            className={inputClass}
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
            disabled={isSubmitting}
            className="w-full bg-brand-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-brand-600 transition-colors shadow-sm disabled:opacity-60"
          >
            {isSubmitting ? "Submitting…" : "Create Ad"}
          </button>
        </div>
      </Modal>
    </>
  );
}
