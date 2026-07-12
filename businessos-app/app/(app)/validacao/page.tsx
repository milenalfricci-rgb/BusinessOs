import { SectionPage } from "@/components/section-page/section-page";
import { listSection } from "@/lib/content";

export default async function ValidacaoPage() {
  const items = await listSection("validacao");
  return <SectionPage section="validacao" title="Validação" items={items} />;
}
