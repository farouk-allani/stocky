import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Target, ArrowRight } from "lucide-react";

export function ProblemSolution() {
  const handleHowItWorks = () => {
    window.location.href = "/how-it-works";
  };

  return (
    <section id="problem-solution" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Problem */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-8 h-8 text-destructive" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                The Problem
              </h2>
            </div>

            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-8">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-foreground">
                      Small businesses still use pen and paper for inventory
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-foreground">
                      1.3 billion tons of food wasted globally each year
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-foreground">
                      Food prices have surged 25-35% in recent years
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-foreground">
                      Expired products lost instead of sold at discount
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Solution */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-8 h-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Our Solution
              </h2>
            </div>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-8">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-foreground">
                      AI-powered photo recognition for instant inventory
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-foreground">
                      Automatic expiry tracking with smart price adjustments
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-foreground">
                      Consumer app connecting people to discounted food
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-foreground">
                      Blockchain transparency for trust and traceability
                    </span>
                  </li>
                </ul>

                <Button
                  variant="default"
                  size="lg"
                  className="w-full"
                  onClick={handleHowItWorks}
                >
                  See How It Works
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
