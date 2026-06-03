import { PageHeader } from "@/components/shared/page-header";
import { SupportWorkspace } from "@/components/support/support-workspace";

export default function SupportPage() {
  return <div><PageHeader title="Support" description="Chat with support/admin and create operational tickets." /><SupportWorkspace /></div>;
}
