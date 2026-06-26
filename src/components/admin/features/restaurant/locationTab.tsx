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

interface LocationTabProps {
  formLogic: {
    address: string;
    setAddress: (address: string) => void;
    latitude: number;
    setLatitude: (latitude: number) => void;
    longitude: number;
    setLongitude: (longitude: number) => void;
    isPending: boolean;
  };
}

export function LocationTab({ formLogic }: LocationTabProps) {
  return (
    <Card className="border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="font-semibold text-lg">
          Address & Coordinates
        </CardTitle>
        <CardDescription>
          Configure physical coordinates for mapping and delivery calculations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1.5">
          <Label htmlFor="address">Physical Address</Label>
          <Input
            id="address"
            placeholder="e.g. 123 Main St, New York, NY 10001"
            value={formLogic.address}
            onChange={(e) => formLogic.setAddress(e.target.value)}
            required
            disabled={formLogic.isPending}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              placeholder="e.g. 40.7128"
              value={formLogic.latitude}
              onChange={(e) => formLogic.setLatitude(Number(e.target.value))}
              required
              disabled={formLogic.isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              placeholder="e.g. -74.0060"
              value={formLogic.longitude}
              onChange={(e) => formLogic.setLongitude(Number(e.target.value))}
              required
              disabled={formLogic.isPending}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
