import { PageTransition } from "@/components/common/page-transition";

export default function ClientTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransition>{children}</PageTransition>;
}
