import { Badge } from "@/components/ui/badge";
import React from "react";

function AboutHero() {
  return (
    <>
      <div className="border-b bg-linear-to-br from-primary/5 via-secondary/30 to-accent/20">
        <div className="container mx-auto px-4 py-16 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
            About Us
          </Badge>
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            Our Story
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Bringing fresh, delicious food to your doorstep since 2020
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-3xl font-bold">Our Mission</h2>
          <p className="mb-4 text-lg text-muted-foreground">
            At Quick Food, we&apos;re on a mission to revolutionize the way you
            experience food delivery. We believe that everyone deserves access
            to fresh, high-quality meals prepared by skilled chefs and delivered
            right to their door.
          </p>
          <p className="text-lg text-muted-foreground">
            We work directly with local farmers and suppliers to source the
            finest ingredients, ensuring every dish we create is not only
            delicious but also sustainable and responsibly sourced.
          </p>
        </div>
      </div>
      <div className="border-y bg-secondary/30">
        <div className="container mx-auto px-4 py-16">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">
                Happy Customers
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Menu Items</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">Locations</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary">4.9</div>
              <div className="text-sm text-muted-foreground">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AboutHero;
