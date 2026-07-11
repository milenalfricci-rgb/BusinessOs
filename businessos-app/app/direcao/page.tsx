import { SectionPage } from "@/components/section-page/section-page";
import { listSection } from "@/lib/content";

export default function DirecaoPage() {
  const items = listSection("direcao");
  return <SectionPage section="direcao" title="Direção" items={items} />;
}
