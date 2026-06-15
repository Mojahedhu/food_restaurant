"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, MapPin, Navigation, Phone } from "lucide-react";
import { useState } from "react";

function ContactMap() {
  const [isLoading, setIsLoading] = useState(true);
  const address = "1200 McKinney St, Houston, TX 77010";
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  return (
    <div className="mt-12 mb-4 bg-card px-4">
      <Card className="shadow-lg overflow-hidden border border-border/50 transition-all duration-300 hover:shadow-xl p-6">
        {/* 
          Mobile: flex-col (stacks map and card vertically)
          Desktop: md:relative md:block (allows absolute overlaying of the card)
        */}
        <CardContent className="p-0 flex flex-col md:relative md:block aspect-auto md:aspect-video w-full">
          {/* Map wrapper container to enforce aspect ratio on mobile & full cover on desktop */}
          <div className="relative aspect-video w-full md:absolute md:inset-0 md:h-full md:w-full rounded-xl overflow-hidden">
            {/* Skeleton Loader */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse z-10">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <MapPin className="h-8 w-8 animate-bounce text-primary" />
                  <span className="text-sm font-medium">Loading Map...</span>
                </div>
              </div>
            )}

            {/* Map Iframe */}

            <iframe
              title="Restaurant Location Map"
              src="https://maps.google.com/maps?q=1200%20McKinney%20St,%20Houston,%20TX%2077010&t=&z=16&ie=UTF8&iwloc=&output=embed"
              className="w-full h-full border-0 grayscale-15 contrast-110 transition-opacity duration-300"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={() => setIsLoading(false)}
            />
          </div>
          {/* 
            Glassmorphic Info Card:
            Mobile: relative (flows underneath the map), margins, no backdrop-blur needed
            Desktop: md:absolute (overlays), positioned bottom-left, backdrop-blur activated

            {/* Glassmorphic Info Card Overlay */}
          <div className="relative md:absolute md:bottom-4 md:left-4 z-20 flex flex-col gap-3 p-5 m-4 md:m-0 md:w-80 rounded-xl bg-background md:bg-background/80 md:backdrop-blur-md border border-border/40 shadow-md md:shadow-lg transition-transform duration-300 hover:scale-[1.01] md:hover:scale-[1.02]">
            <div>
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                Our Location
              </h4>
              <p className="text-xs text-muted-foreground mt-1 ml-6 leading-relaxed">
                {address}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-border/40 pt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>9:00 AM - 10:00 PM</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>+1 713-555-0199</span>
              </div>
            </div>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 w-full py-2 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-2 hover:bg-primary/95 active:scale-[0.98] transition-all"
            >
              <Navigation className="h-3.5 w-3.5 fill-current" />
              Get Directions
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ContactMap;
