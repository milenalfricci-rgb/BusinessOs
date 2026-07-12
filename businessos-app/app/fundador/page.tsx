import { SectionPage } from "@/components/section-page/section-page";
import { listSection } from "@/lib/content";

export default async function FundadorPage() {
  const items = await listSection("fundador");
  return <SectionPage section="fundador" title="Fundador" items={items} />;
}
