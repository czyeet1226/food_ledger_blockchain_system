"use client";

import { useState } from "react";

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

export function Tabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);

  return (
    <div>
      <div
        className="flex gap-1 bg-gray-100/80 p-1 rounded-xl mb-6 overflow-x-auto"
        role="tablist"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
              active === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="animate-fade-in">
        {tabs.find((t) => t.id === active)?.content}
      </div>
    </div>
  );
}
