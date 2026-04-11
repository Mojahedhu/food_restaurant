import { getBanners } from "@/lib/sanityFunctions";

import HeroUi from "../hero/heroUi";

const Hero = async () => {
  const banners = await getBanners();
  return <HeroUi banners={banners} />;
};

export default Hero;
