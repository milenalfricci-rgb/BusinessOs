import { SectionPage } from "@/components/section-page/section-page";
import { listSection } from "@/lib/content";

export default async function DirecaoPage() {
  const items = await listSection("direcao");
  return <SectionPage section="direcao" title="Direção" items={items} />;
}
