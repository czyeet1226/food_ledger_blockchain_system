"use client";

const variants: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10",
  red: "bg-red-50 text-red-700 ring-1 ring-red-600/10",
  yellow: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/10",
  blue: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/10",
  gray: "bg-gray-50 text-gray-600 ring-1 ring-gray-500/10",
  purple: "bg-purple-50 text-purple-700 ring-1 ring-purple-600/10",
};

export function Badge({
  children,
  variant = "gray",
}: {
  children: React.ReactNode;
  variant?: string;
}) {
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${variants[variant] || variants.gray}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: string; label: string }> = {
    approved: { variant: "green", label: "Approved" },
    pending: { variant: "yellow", label: "Pending" },
    rejected: { variant: "red", label: "Rejected" },
    confirmed: { variant: "green", label: "Confirmed" },
    failed: { variant: "red", label: "Failed" },
    open: { variant: "yellow", label: "Open" },
    investigating: { variant: "blue", label: "Investigating" },
    resolved: { variant: "green", label: "Resolved" },
    dismissed: { variant: "gray", label: "Dismissed" },
  };
  const { variant, label } = map[status] || { variant: "gray", label: status };
  return <Badge variant={variant}>{label}</Badge>;
}
