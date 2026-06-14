import { Breadcrumb } from "@/components/common/breadcrumb";
import AboutHero from "./_components/aboutHero";
import AboutMain from "./_components/aboutMain";
import AboutValue from "./_components/aboutValue";

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Breadcrumb
        items={[
          {
            label: "About",
            href: "/about",
          },
        ]}
      />
      <AboutHero />
      <AboutMain />
      <AboutValue />
    </div>
  );
}

export default AboutPage;
