function AboutValue() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-12 text-center text-3xl font-bold">Our Values</h2>
        <div className="space-y-8">
          <div>
            <h3 className="mb-2 text-xl font-semibold text-primary">
              Quality First
            </h3>
            <p className="text-muted-foreground">
              We never compromise on the quality of our ingredients or
              preparation. Every dish meets our rigorous standards before it
              reaches your table.
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-xl font-semibold text-primary">
              Sustainability
            </h3>
            <p className="text-muted-foreground">
              We&apos;re committed to reducing our environmental impact through
              eco-friendly packaging and supporting local, sustainable food
              sources.
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-xl font-semibold text-primary">
              Customer Satisfaction
            </h3>
            <p className="text-muted-foreground">
              Your happiness is our success. We go above and beyond to ensure
              every order exceeds your expectations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutValue;
