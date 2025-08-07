import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { ProblemSolution } from "@/components/ProblemSolution";
import { Features } from "@/components/Features";
import { TargetAudience } from "@/components/TargetAudience";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Hero />
        <ProblemSolution />
        <Features />
        <TargetAudience />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
