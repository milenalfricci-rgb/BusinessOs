import { SectionPage } from "@/components/section-page/section-page";
import { listSection } from "@/lib/content";

export default async function CaixaPage() {
  const items = await listSection("caixa");
  return <SectionPage section="caixa" title="Caixa" items={items} />;
}
