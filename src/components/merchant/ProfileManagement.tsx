"use client";

import { useState } from "react";
import { useStore } from "@/store";
import { Card } from "@/components/ui/Card";
import type { Merchant } from "@/types";

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

  return (
    <Card>
      <h3 className="font-semibold mb-4">Restaurant Profile</h3>
      <div className="grid grid-cols-2 gap-4 max-w-2xl">
        {Object.entries(form).map(([key, val]) => (
          <div key={key}>
            <label
              htmlFor={key}
              className="text-sm font-medium capitalize block mb-1"
            >
              {key.replace(/([A-Z])/g, " $1")}
            </label>
            {key === "description" ? (
              <textarea
                id={key}
                value={val}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full border rounded-lg p-2 text-sm"
                rows={3}
              />
            ) : (
              <input
                id={key}
                type="text"
                value={val}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full border rounded-lg p-2 text-sm"
              />
            )}
          </div>
        ))}
      </div>
      <button
        onClick={handleSave}
        className="mt-4 bg-brand-500 text-white px-6 py-2 rounded-lg text-sm hover:bg-brand-600 transition-colors"
      >
        {saved ? "Saved!" : "Save Changes"}
      </button>
    </Card>
  );
}
