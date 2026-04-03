"use client";

import { useState } from "react";
import { useStore } from "@/store";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Plus } from "lucide-react";

export function MembershipPlans() {
  const { currentUser, plans, createPlan, togglePlan } = useStore();
  const myPlans = plans.filter((p) => p.merchantId === currentUser?.id);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    duration: "",
    benefits: "",
    maxSupply: "",
  });

  const handleCreate = () => {
    if (!currentUser) return;
    createPlan({
      merchantId: currentUser.id,
      merchantName: currentUser.name,
      title: form.title,
      description: form.description,
      price: parseFloat(form.price) || 0,
      duration: parseInt(form.duration) || 30,
      benefits: form.benefits
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean),
      maxSupply: parseInt(form.maxSupply) || 100,
      isActive: true,
    });
    setShowCreate(false);
    setForm({
      title: "",
      description: "",
      price: "",
      duration: "",
      benefits: "",
      maxSupply: "",
    });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Membership Plans</h3>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1 bg-brand-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-600"
        >
          <Plus size={16} /> Create Plan
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {myPlans.map((p) => (
          <Card key={p.id}>
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold">{p.title}</h4>
              <Badge variant={p.isActive ? "green" : "gray"}>
                {p.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-3">{p.description}</p>
            <div className="flex gap-4 text-sm text-gray-500 mb-3">
              <span>{p.price} ETH</span>
              <span>{p.duration} days</span>
              <span>
                {p.sold}/{p.maxSupply} sold
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {p.benefits.map((b, i) => (
                <span
                  key={i}
                  className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded"
                >
                  {b}
                </span>
              ))}
            </div>
            <button
              onClick={() => togglePlan(p.id)}
              className={`text-sm px-3 py-1 rounded-lg ${p.isActive ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-brand-500 text-white hover:bg-brand-600"}`}
            >
              {p.isActive ? "Deactivate" : "Activate"}
            </button>
          </Card>
        ))}
      </div>

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Membership Plan"
      >
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Plan Title"
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
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Price (ETH)"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full border rounded-lg p-2 text-sm"
            />
            <input
              type="number"
              placeholder="Duration (days)"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>
          <input
            type="number"
            placeholder="Max Supply"
            value={form.maxSupply}
            onChange={(e) => setForm({ ...form, maxSupply: e.target.value })}
            className="w-full border rounded-lg p-2 text-sm"
          />
          <input
            type="text"
            placeholder="Benefits (comma separated)"
            value={form.benefits}
            onChange={(e) => setForm({ ...form, benefits: e.target.value })}
            className="w-full border rounded-lg p-2 text-sm"
          />
          <button
            onClick={handleCreate}
            className="w-full bg-brand-500 text-white py-2 rounded-lg text-sm hover:bg-brand-600"
          >
            Create Plan
          </button>
        </div>
      </Modal>
    </>
  );
}
