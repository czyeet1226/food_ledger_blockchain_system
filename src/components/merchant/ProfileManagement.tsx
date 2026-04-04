"use client";

import { useState } from "react";
import { useStore } from "@/store";
import { Card } from "@/components/ui/Card";
import type { Merchant } from "@/types";
import { Save, CheckCircle } from "lucide-react";

export function ProfileManagement() {
  const { currentUser, updateMerchant } = useStore();
  const merchant = currentUser as Merchant;
  const [form, setForm] = useState({
    businessName: merchant.businessName,
    description: merchant.description,
    cuisine: merchant.cuisine,
    location: merchant.location,
    phone: merchant.phone,
    email: merchant.email,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateMerchant(merchant.id, form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const fieldLabels: Record<string, string> = {
    businessName: "Business Name",
    description: "Description",
    cuisine: "Cuisine Type",
    location: "Location",
    phone: "Phone",
    email: "Email",
  };

  return (
    <Card>
      <h3 className="font-semibold text-gray-900 mb-6">Restaurant Profile</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
        {Object.entries(form).map(([key, val]) => (
          <div
            key={key}
            className={key === "description" ? "md:col-span-2" : ""}
          >
            <label
              htmlFor={key}
              className="text-sm font-medium text-gray-700 block mb-1.5"
            >
              {fieldLabels[key] || key}
            </label>
            {key === "description" ? (
              <textarea
                id={key}
                value={val}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 outline-none transition-all resize-none"
                rows={3}
              />
            ) : (
              <input
                id={key}
                type="text"
                value={val}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 outline-none transition-all"
              />
            )}
          </div>
        ))}
      </div>
      <button
        onClick={handleSave}
        className={`mt-6 flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
          saved
            ? "bg-emerald-500 text-white"
            : "bg-brand-500 text-white hover:bg-brand-600 shadow-sm"
        }`}
      >
        {saved ? (
          <>
            <CheckCircle size={16} /> Saved
          </>
        ) : (
          <>
            <Save size={16} /> Save Changes
          </>
        )}
      </button>
    </Card>
  );
}
