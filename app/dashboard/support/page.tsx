import { PageHeader } from "@/components/shared/page-header";
import { SupportChat } from "@/components/support/support-chat";
import { TicketForm } from "@/components/support/ticket-form";

export default function SupportPage() {
  return <div><PageHeader title="Support" description="Chat with support/admin and create operational tickets." /><div className="grid grid-cols-[minmax(0,1fr)_360px] gap-4"><SupportChat /><TicketForm /></div></div>;
}
