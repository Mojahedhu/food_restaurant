import { Button } from "@/components/ui/button";

function BlogNewsletter() {
  return (
    <div className="bg-primary/5 p-8 rounded-xl text-center border border-primary/10">
      <h3 className="font-bold text-xl mb-2 text-primary">
        Join Our Newsletter
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Get the latest recipes delivered straight to your inbox.
      </p>
      <input
        className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mb-3 bg-white"
        placeholder="Your email address"
      ></input>
      <Button className="w-full font-bold">Subscribe Now</Button>
    </div>
  );
}

export default BlogNewsletter;
