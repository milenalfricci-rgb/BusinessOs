import { SidebarNavItem } from "@/components/sidebar/sidebar-nav-item";

const NAV_ITEMS = [
  { href: "/fundador", label: "Fundador" },
  { href: "/direcao", label: "Direção" },
  { href: "/validacao", label: "Validação" },
  { href: "/caixa", label: "Caixa" },
] as const;

export function Sidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col gap-1 border-r border-border bg-background p-4">
      <div className="mb-4 px-3 text-sm font-semibold tracking-tight">
        BusinessOS
      </div>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem key={item.href} href={item.href} label={item.label} />
        ))}
      </nav>
    </aside>
  );
}
