import React from "react";
import { BreadcrumbSkeleton } from "../restaurants/_components/breadcrumbSkeleton";
import AboutHeroSkeleton from "./_components/aboutHeroSkeleton";
import AboutMainSkeleton from "./_components/aboutMainSkeleton";
import AboutValueSkeleton from "./_components/aboutValueSkeleton";

function AboutLoadingPage() {
  return (
    <div className="min-h-screen bg-background">
      <BreadcrumbSkeleton />
      <AboutHeroSkeleton />
      <AboutMainSkeleton />
      <AboutValueSkeleton />
    </div>
  );
}

export default AboutLoadingPage;
