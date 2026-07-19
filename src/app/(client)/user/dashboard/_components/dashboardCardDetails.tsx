import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardCardDetailsProps {
  title: string;
  value: number | string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
  iconStyle: string;
}
export function DashboardCardDetails({
  title,
  value,
  description,
  Icon,

  iconStyle,
}: DashboardCardDetailsProps) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="flex! flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${iconStyle}`}>
          <Icon />
        </div>
      </CardHeader>
      <CardContent className="px-6">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
