import { SectionPage } from "@/components/section-page/section-page";
import { listSection } from "@/lib/content";

export default function FundadorPage() {
  const items = listSection("fundador");
  return <SectionPage section="fundador" title="Fundador" items={items} />;
}
