"use client";
import AddToCart from "@/components/foods/addToCart";
import { Badge } from "@/components/ui/badge";
import { urlFor } from "@/sanity/lib/image";

import Image from "next/image";
import Link from "next/link";
import { StarRating } from "@/components/foods/starRating";
import { Flame } from "lucide-react";
import { FoodWithDetails } from "../../../../../../types/sanityTypes";
import { useState } from "react";
import FoodImageModal from "./foodImageModal";

interface FoodGalleryProps {
  foodDetails: FoodWithDetails;
}
const FoodGallery = ({ foodDetails }: FoodGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div className="space-y-4">
        <div
          className="relative w-full aspect-square rounded-2xl overflow-hidden bg-muted cursor-pointer group"
          onClick={() => {
            setIsOpen(true);
            setCurrentIndex(0);
          }}
        >
          {foodDetails.images && foodDetails.name && (
            <Image
              src={urlFor(foodDetails.images[0]).url()}
              alt={foodDetails.name}
              width={800}
              height={800}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              style={{ color: "transparent" }}
              loading={"eager"}
            />
          )}
          {foodDetails.featured && (
            <Badge className=" absolute top-4 left-4 bg-primary text-primary-foreground">
              Featured
            </Badge>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="text-white font-semibold text-sm bg-black/50 px-4 py-2 rounded-full">
              Click to view all images
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {foodDetails.images &&
            foodDetails.name &&
            foodDetails.images.map((img, index) => {
              if (index === 0) return null;
              return (
                <div
                  key={img._key}
                  className="relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-75 transition-opacity border-2 border-transparent hover:border-primary"
                  onClick={() => {
                    setIsOpen(true);
                    setCurrentIndex(index);
                  }}
                >
                  <Image
                    src={urlFor(img).url()}
                    alt={foodDetails.name! + "-img" + index}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    style={{ color: "transparent" }}
                    loading={"lazy"}
                  />
                </div>
              );
            })}
        </div>
      </div>
      {isOpen && (
        <FoodImageModal
          images={foodDetails.images || []}
          foodName={foodDetails.name || ""}
          currentIndex={currentIndex}
          onClose={() => setIsOpen(false)}
        />
      )}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href={`/category/${foodDetails?.category?.slug}`}>
            <Badge variant={"outline"} className="hover:bg-primary/10">
              {foodDetails?.category?.name}
            </Badge>
          </Link>
          <StarRating rating={foodDetails.averageRating || 0} showValue />
        </div>
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            {foodDetails.name}
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {foodDetails.description}
          </p>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-primary">
            ${foodDetails.basePrice?.toFixed(2)}
          </span>
          <span className="text-muted-foreground line-through">
            <span className="text-base font-semibold text-primary line-through">
              ${(foodDetails.basePrice! * 1.2).toFixed(2)}
            </span>
          </span>
          <Badge className="bg-green-500">20% OFF</Badge>
        </div>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="text-center p-3 rounded-lg bg-muted">
            <Flame className="w-5 h-5 mx-auto mb-1 text-primary" />
            <div className="text-xs text-muted-foreground">Spice Level</div>
            <div className="font-semibold text-foreground capitalize">
              {foodDetails.spiceLevel}
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Available Sizes
          </h3>
          <div className="flex flex-col sm:flex-row gap-2">
            {foodDetails.sizes?.map((size) => (
              <button
                key={size._key}
                className="px-4 py-2 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
              >
                <div className="font-semibold text-foreground">
                  {size.size.name === "Small"
                    ? "Solo Platter (1 Person)"
                    : "Duet Platter (2 People)"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {size.size.name === "Small" ? 1 : 2} oz
                </div>
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Varieties
          </h3>
          <div className="flex flex-wrap gap-2">
            {foodDetails.varieties?.map((variety) => (
              <Badge key={variety._id} variant={"outline"}>
                {variety.name}
              </Badge>
            ))}
          </div>
        </div>
        <div className="pt-4">
          <AddToCart food={foodDetails} className="py-4 text-base" />
        </div>
      </div>
    </>
  );
};

export default FoodGallery;
