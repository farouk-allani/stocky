import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, Users, ArrowRight } from "lucide-react";

export function TargetAudience() {
  return (
    <section className="py-24 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Built for
            <span className="bg-gradient-secondary bg-clip-text text-transparent">
              {" "}
              Everyone
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stocky serves both sides of the food waste problem, creating value
            for businesses and consumers alike.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Businesses */}
          <Card className="border-0 shadow-elegant hover:shadow-glow transition-all duration-300 bg-card/90 backdrop-blur-sm">
            <CardContent className="p-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-6">
                  <Store className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-card-foreground mb-4">
                  For Businesses
                </h3>
                <p className="text-muted-foreground">
                  Grocery stores, restaurants, and food retailers
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-card-foreground">
                    Reduce inventory management time by 80%
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-card-foreground">
                    Avoid losses from expired stock
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-card-foreground">
                    Gain visibility on consumer marketplace
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-card-foreground">
                    Access advanced analytics and insights
                  </span>
                </div>
              </div>

              <Button variant="default" className="w-full">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Button>
            </CardContent>
          </Card>

          {/* Consumers */}
          <Card className="border-0 shadow-elegant hover:shadow-glow transition-all duration-300 bg-card/90 backdrop-blur-sm">
            <CardContent className="p-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-secondary rounded-full mb-6">
                  <Users className="w-8 h-8 text-secondary-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-card-foreground mb-4">
                  For Consumers
                </h3>
                <p className="text-muted-foreground">
                  Families, students, and sustainability-conscious shoppers
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-card-foreground">
                    Save up to 50% on quality groceries
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-card-foreground">
                    Discover rare and seasonal items
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-card-foreground">
                    Shop sustainably and reduce waste
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-card-foreground">
                    Secure payments via Hedera blockchain
                  </span>
                </div>
              </div>

              <Button variant="secondary" className="w-full">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
