import { SectionPage } from "@/components/section-page/section-page";
import { listSection } from "@/lib/content";

export default function ValidacaoPage() {
  const items = listSection("validacao");
  return <SectionPage section="validacao" title="Validação" items={items} />;
}
