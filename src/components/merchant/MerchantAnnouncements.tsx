"use client";

import { useState } from "react";
import { useStore } from "@/store";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Plus, Megaphone } from "lucide-react";

export function MerchantAnnouncements() {
  const { currentUser, announcements, createAnnouncement } = useStore();
  const myAnnouncements = announcements.filter(
    (a) => a.merchantId === currentUser?.id,
  );
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });

  const handleCreate = () => {
    if (!currentUser) return;
    createAnnouncement({
      merchantId: currentUser.id,
      merchantName: currentUser.name,
      title: form.title,
      content: form.content,
    });
    setShowCreate(false);
    setForm({ title: "", content: "" });
  };

  const inputClass =
    "w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 outline-none transition-all";

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-gray-900">Announcements</h3>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 bg-brand-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-600 transition-colors shadow-sm"
        >
          <Plus size={16} /> New Announcement
        </button>
      </div>
      <div className="space-y-4">
        {myAnnouncements.map((a) => (
          <Card
            key={a.id}
            className="hover:shadow-card-hover transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                <Megaphone size={18} className="text-brand-500" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{a.title}</h4>
                <p className="text-sm text-gray-500 mt-1">{a.content}</p>
                <p className="text-xs text-gray-400 mt-2">{a.createdAt}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="New Announcement"
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputClass}
          />
          <textarea
            placeholder="Content"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className={inputClass + " resize-none"}
            rows={4}
          />
          <button
            onClick={handleCreate}
            className="w-full bg-brand-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-brand-600 transition-colors shadow-sm"
          >
            Publish
          </button>
        </div>
      </Modal>
    </>
  );
}
