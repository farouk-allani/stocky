import { Card, CardContent } from "@/components/ui/card";
import { Camera, TrendingDown, Shield, Smartphone, BarChart3, Leaf } from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "AI Image Recognition",
    description: "Simply take a photo to add products to inventory. No manual entry required.",
    color: "text-primary"
  },
  {
    icon: TrendingDown,
    title: "Dynamic Pricing",
    description: "Automatic price reductions as expiry dates approach to minimize waste.",
    color: "text-accent"
  },
  {
    icon: Shield,
    title: "Hedera Blockchain",
    description: "Transparent, secure transactions with immutable product tracking.",
    color: "text-secondary"
  },
  {
    icon: Smartphone,
    title: "Consumer Mobile App",
    description: "Discover discounted products near you and shop sustainably.",
    color: "text-primary"
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description: "Advanced insights to optimize inventory and reduce losses.",
    color: "text-accent"
  },
  {
    icon: Leaf,
    title: "Sustainability Impact",
    description: "Track your contribution to reducing global food waste.",
    color: "text-secondary"
  }
];

export function Features() {
  return (
    <section className="py-24 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Powerful Features for 
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Smart Management</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From AI-powered inventory to blockchain security, Stocky provides everything you need 
            to reduce waste and increase profits.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-elegant hover:shadow-glow transition-all duration-300 transform hover:scale-105 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <feature.icon className={`w-12 h-12 mx-auto ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-4">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}