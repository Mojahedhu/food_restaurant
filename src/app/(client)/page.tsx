import Container from "@/components/common/container";
import FeaturedPost from "@/components/featuredPost/featuredPost";
import Categories from "@/components/foods/categories";
import FeaturedFoods from "@/components/home/featuredFoods";
import FeaturedRestaurants from "@/components/home/featuredRestaurants";
import Hero from "@/components/home/hero";
import HowItWorks from "@/components/home/howItWorks";

const Home = async () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Container>
        <HowItWorks />
        <FeaturedFoods />
        <FeaturedRestaurants />
        <Categories />
        <FeaturedPost />
      </Container>
    </div>
  );
};

export default Home;
