"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, Upload } from "lucide-react";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { SanityAsset } from "@sanity/image-url";

interface GeneralInfoTabProps {
  formLogic: {
    name: string;
    setName: (name: string) => void;
    slug: string;
    setSlug: (slug: string) => void;
    description: string;
    setDescription: (description: string) => void;
    phone: string;
    setPhone: (phone: string) => void;
    email: string;
    setEmail: (email: string) => void;
    previewUrl: string;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isPending: boolean;
  };
  logoUrl: SanityAsset | undefined;
}

export function GeneralInfoTab({ formLogic, logoUrl }: GeneralInfoTabProps) {
  const displayImage = formLogic.previewUrl
    ? formLogic.previewUrl
    : logoUrl
      ? urlFor(logoUrl).url()
      : "";

  return (
    <Card className="border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="font-semibold text-lg">General Info</CardTitle>
        <CardDescription>
          Configure basic metadata and contact info.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo/Image uploader */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Restaurant Logo/Image</Label>
          <div className="flex flex-col sm:flex-row items-center gap-6 p-5 border border-dashed rounded-xl bg-slate-50/50">
            <div className="relative w-32 h-24 rounded-lg overflow-hidden border bg-slate-100 flex items-center justify-center shrink-0">
              {displayImage ? (
                <Image
                  src={displayImage}
                  alt="Restaurant Logo"
                  fill
                  className="object-cover"
                />
              ) : (
                <ImageIcon className="size-8 text-muted-foreground opacity-40" />
              )}
            </div>
            <div className="space-y-2 text-center sm:text-left">
              <label className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-semibold shadow-sm cursor-pointer hover:bg-slate-50 transition-colors w-fit mx-auto sm:mx-0">
                <Upload className="size-4 text-muted-foreground" />
                Upload logo file
                <input
                  type="file"
                  accept="image/*"
                  onChange={formLogic.handleFileChange}
                  className="hidden"
                  disabled={formLogic.isPending}
                />
              </label>
              <p className="text-[10px] text-muted-foreground">
                Supported format JPG, PNG. Max size 2MB
              </p>
            </div>
          </div>
        </div>

        {/* Input Details */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="restaurantName">Restaurant Name</Label>
            <Input
              id="restaurantName"
              value={formLogic.name}
              onChange={(e) => {
                formLogic.setName(e.target.value);
                formLogic.setSlug(
                  e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                );
              }}
              required
              disabled={formLogic.isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="restaurantSlug">Slug</Label>
            <Input
              id="restaurantSlug"
              value={formLogic.slug}
              onChange={(e) =>
                formLogic.setSlug(
                  e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                )
              }
              required
              disabled={formLogic.isPending}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="restaurantDesc">Description</Label>
          <Textarea
            id="restaurantDesc"
            value={formLogic.description}
            onChange={(e) => formLogic.setDescription(e.target.value)}
            required
            className="h-28 resize-none"
            disabled={formLogic.isPending}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="restaurantPhone">Phone number</Label>
            <Input
              id="restaurantPhone"
              value={formLogic.phone}
              onChange={(e) => formLogic.setPhone(e.target.value)}
              required
              disabled={formLogic.isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="restaurantEmail">Email Address</Label>
            <Input
              id="restaurantEmail"
              type="email"
              value={formLogic.email}
              onChange={(e) => formLogic.setEmail(e.target.value)}
              required
              disabled={formLogic.isPending}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
