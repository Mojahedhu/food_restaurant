import { Card, CardContent } from "@/components/ui/card";
import { Award, Clock, Heart, Shield, Truck, Users } from "lucide-react";

interface Features {
  Icon: () => React.ReactNode;
  title: string;
  description: string;
}
const iconStyle = "h-6 w-6 text-primary";

const features: Features[] = [
  {
    Icon: () => <Clock className={iconStyle} />,
    title: "Fast Delivery",
    description: "30-minute delivery guarantee or your money back",
  },
  {
    Icon: () => <Award className={iconStyle} />,
    title: "Quality Food",
    description: "Fresh ingredients sourced from local farms",
  },
  {
    Icon: () => <Users className={iconStyle} />,
    title: "Expert Chefs",
    description: "Professionally trained culinary experts",
  },
  {
    Icon: () => <Heart className={iconStyle} />,
    title: "Made with Love",
    description: "Every dish prepared with care and passion",
  },
  {
    Icon: () => <Truck className={iconStyle} />,
    title: "Wide Coverage",
    description: "Delivering to 50+ locations daily",
  },
  {
    Icon: () => <Shield className={iconStyle} />,
    title: "Safe & Hygienic",
    description: "Following highest food safety standards",
  },
];

function AboutWhy() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-3xl font-bold">Why Choose Us</h2>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          We&apos;re committed to providing the best food delivery experience
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((item) => (
          <AboutCard
            key={item.title}
            icon={item.Icon()}
            title={item.title}
            description={item.description}
          />
        ))}
      </div>
    </div>
  );
}

export default AboutWhy;

interface AboutCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function AboutCard({ icon, title, description }: AboutCardProps) {
  return (
    <Card className="shadow-sm hover:drop-shadow-xl">
      <CardContent className="p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          {icon}
        </div>
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
