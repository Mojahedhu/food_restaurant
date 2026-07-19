import { PageTransition } from "@/components/common/page-transition";

interface Props {
  children: React.ReactNode;
}

function UserTemplate({ children }: Props) {
  return <PageTransition>{children}</PageTransition>;
}

export default UserTemplate;
