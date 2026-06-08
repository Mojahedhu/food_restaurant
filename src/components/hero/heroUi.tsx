/* eslint-disable react-hooks/refs */
"use client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { Banner } from "../../../sanity.types";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import Container from "../common/container";
import { cn } from "@/lib/utils";
import AnimatedButton from "../common/animatedButton";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import AutoPlay from "embla-carousel-autoplay";

const HeroUi = ({ banners }: { banners: Banner[] }) => {
  console.log(banners.map((ban) => ban.title));
  const plugin = useRef(
    AutoPlay({
      delay: 5000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    }),
  );
  if (!banners || banners.length === 0) {
    return null;
  }
  return (
    <section className="relative w-full overflow-hidden mb-16">
      <Carousel
        // eslint-disable-next-line react-hooks/refs
        plugins={[plugin.current]}
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        className="w-full"
        opts={{
          loop: true,
          align: "start",
        }}
      >
        <CarouselContent>
          {banners.map((banner: Banner, index: number) => {
            const isRightAligned = index === 1;
            return (
              <CarouselItem
                key={banner._id}
                className="relative w-full h-150 md:175"
              >
                {/* Full width background image */}
                {banner?.bannerImage && (
                  <div className="absolute inset-0">
                    <Image
                      src={urlFor(banner?.bannerImage).width(1920).url()}
                      alt={" "}
                      width={1920}
                      height={700}
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay for better text visibility */}
                    <div className="absolute inset-0 bg-primary/10" />
                  </div>
                )}
                {/* Content container */}
                <Container
                  className={cn(
                    "relative z-10 h-full flex items-center",
                    isRightAligned ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-2xl bg-transparent p-0 animate-in duration-700 fade-in-0 mt-10 text-start",
                      isRightAligned
                        ? "slide-in-from-right"
                        : "slide-in-from-left",
                    )}
                  >
                    {/* Badge */}
                    <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold text-primary-foreground uppercase tracking-wider bg-primary rounded-full shadow-lg">
                      Fresh & Organic
                    </span>
                    <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl mb-6 shadow-foreground drop-shadow-lg text-start">
                      {banner.title}
                    </h1>
                    <p
                      className={cn(
                        "text-lg text-start md:text-xl text-foreground leading-relaxed font-medium mb-8 drop-shadow-md max-w-lg mr-auto",
                      )}
                    >
                      {banner.description}
                    </p>
                    <div
                      className={cn(
                        "flex flex-col sm:flex-row gap-4 justify-end",
                      )}
                    >
                      <AnimatedButton href={"/menu"}>
                        {banner?.buttonTitle}
                        <ArrowRight className="ml-2 h-5 w-5 " />
                      </AnimatedButton>
                      <AnimatedButton href="/menu">View Menu</AnimatedButton>
                    </div>
                  </div>
                </Container>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="left-4 z-20 bg-background/50 border-background/40 text-background  hover:text-primary hover:border-primary " />
        <CarouselNext className="right-4 z-20 bg-background/50 border-background/40 text-background  hover:text-primary hover:border-primary" />
      </Carousel>
    </section>
  );
};

export default HeroUi;
