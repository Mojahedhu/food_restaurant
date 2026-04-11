import { MousePointerClick, Truck, Utensils } from "lucide-react";
import React from "react";

const steps = [
  {
    id: 1,
    title: "Choose your Favorite",
    description:
      "choose your favorite meals and order online or by phone. It's easy to customize your order",
    icon: MousePointerClick,
  },
  {
    id: 2,
    title: "We Deliver Your Meals",
    description:
      "We prepared and delivered meals arrive at your door. Duis autem vel eum iriure dolor in hendrerit in vulputate.",
    icon: Truck,
  },
  {
    id: 3,
    title: "Eat and Enjoy",
    description:
      '"No shopping, no cooking, no counting and no cleaning. Enjoy your healthy meals with your family."',
    icon: Utensils,
  },
];

const HowItWorks = () => {
  return (
    <section className="bg-background py-20">
      <div className="text-center">
        <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-foreground md:text-5xl uppercase">
          How it <span className="text-primary">Works</span>
        </h2>
        <div className="mx-auto mb-16 h-1 w-24 rounded-full bg-muted relative">
          <div className="absolute left-1/2 -translate-x-1/2 -top-1/2 w-6 h-2 bg-primary rounded-full" />
        </div>
        <div className="grid md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className="relative flex flex-col items-center group"
              >
                {/* Connector line (hidden in mobile ana last item) */}
                {index !== steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[calc(50%+4rem)] w-[calc(100%-8rem)] h-0.5 border-t-2 border-dashed border-border z-0" />
                )}
                <div className="relative z-10 mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-background border-2 border-primary shadow-md transition-transform group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-transparent text-primary ">
                  <Icon className="h-10 w-10" />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-foreground uppercase tracking-wide">
                  {step.title}
                </h3>
                <p className="max-w-xs text-muted-foreground leading-relaxed mx-auto">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
