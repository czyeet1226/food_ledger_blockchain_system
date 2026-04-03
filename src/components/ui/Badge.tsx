"use client";

const variants: Record<string, string> = {
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  yellow: "bg-yellow-100 text-yellow-700",
  blue: "bg-blue-100 text-blue-700",
  gray: "bg-gray-100 text-gray-600",
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
      className={`text-xs font-medium px-2 py-0.5 rounded-full ${variants[variant] || variants.gray}`}
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
