import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function ContactHelp() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="">
        <CardTitle className="font-semibold text-lg">Quick Help</CardTitle>
      </CardHeader>
      <CardContent className="px-6 space-y-2">
        <a
          href="/faq"
          className="block text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          FAQ
        </a>
        <a
          href="/shipping"
          className="block text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          Shipping Policy
        </a>
        <a
          href="/returns"
          className="block text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          Returns &amp; Refunds
        </a>
        <a
          href="/track"
          className="block text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          Track Order
        </a>
      </CardContent>
    </Card>
  );
}

export default ContactHelp;
