import { SectionPage } from "@/components/section-page/section-page";
import { listSection } from "@/lib/content";

export default function CaixaPage() {
  const items = listSection("caixa");
  return <SectionPage section="caixa" title="Caixa" items={items} />;
}
