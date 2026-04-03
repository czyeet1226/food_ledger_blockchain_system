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

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Announcements</h3>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1 bg-brand-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-600"
        >
          <Plus size={16} /> New Announcement
        </button>
      </div>
      <div className="space-y-4">
        {myAnnouncements.map((a) => (
          <Card key={a.id}>
            <div className="flex items-start gap-3">
              <Megaphone size={20} className="text-brand-500 mt-0.5" />
              <div>
                <h4 className="font-semibold">{a.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{a.content}</p>
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
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border rounded-lg p-2 text-sm"
          />
          <textarea
            placeholder="Content"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full border rounded-lg p-2 text-sm"
            rows={4}
          />
          <button
            onClick={handleCreate}
            className="w-full bg-brand-500 text-white py-2 rounded-lg text-sm hover:bg-brand-600"
          >
            Publish
          </button>
        </div>
      </Modal>
    </>
  );
}
