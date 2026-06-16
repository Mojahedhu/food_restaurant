import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MaleChef } from "./maleChef";
import { FemaleChef } from "./femaleChef";
interface Team {
  name: string;
  role: string;
  image: React.ReactNode;
  info: string;
}

const team: Team[] = [
  {
    name: "John Smith",
    role: "Head Chef",
    image: <MaleChef />,
    info: "15 years of culinary excellence",
  },
  {
    name: "Sarah Johnson",
    role: "Pastry Chef",
    image: <FemaleChef />,
    info: "Award-winning dessert specialist",
  },
  {
    name: "Michael Brown",
    role: "Sous Chef",
    image: <MaleChef />,
    info: "Expert in Mediterranean cuisine",
  },
];

function AboutTeam() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-3xl font-bold">Meet Our Team</h2>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          The talented people behind your delicious meals
        </p>
      </div>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {team.map((member) => (
          <TeamCard key={member.name} {...member} />
        ))}
      </div>
    </div>
  );
}

export default AboutTeam;

interface TeamCardProps {
  name: string;
  role: string;
  image: React.ReactNode;
  info: string;
}

function TeamCard({ name, role, image, info }: TeamCardProps) {
  return (
    <Card className="shadow-sm hover:drop-shadow-xl">
      <CardContent className="p-0">
        <div className="flex h-64 items-center justify-center bg-linear-to-br from-primary/10 to-accent/10">
          <span className="text-9xl">{image}</span>
        </div>
        <div className="p-6 text-center">
          <h3 className="mb-1 text-xl font-semibold">{name}</h3>
          <Badge variant={"secondary"} className="mb-3 text-foreground">
            {role}
          </Badge>
          <p className="text-sm text-muted-foreground">{info}</p>
        </div>
      </CardContent>
    </Card>
  );
}
