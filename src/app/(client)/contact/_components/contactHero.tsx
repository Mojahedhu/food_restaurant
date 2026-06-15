import { Badge } from "@/components/ui/badge";

function ContactHero() {
  return (
    <div className="border-b bg-linear-to-br from-primary/5 via-secondary/30 to-accent/20">
      <div className="container mx-auto px-4 py-16 text-center">
        <Badge variant="secondary" className="text-primary">
          Get in Touch
        </Badge>
        <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
          Contact Us
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Have a question or feedback? We&apos;d love to hear from you.
        </p>
      </div>
    </div>
  );
}

export default ContactHero;
