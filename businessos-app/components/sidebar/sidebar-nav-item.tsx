"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface SidebarNavItemProps {
  href: string;
  label: string;
  icon?: ReactNode;
}

export function SidebarNavItem({ href, label, icon }: SidebarNavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-foreground/80"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
