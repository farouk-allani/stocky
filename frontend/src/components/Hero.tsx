import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, Leaf } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { AuthModal } from "./AuthModal";
import { useAuthStore } from "@/lib/auth";

export function Hero() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuthStore();

  const handleGetStarted = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      // Navigate to dashboard based on user role
      if (user.role === 'BUSINESS') {
        window.location.href = '/business-dashboard';
      } else {
        window.location.href = '/consumer-dashboard';
      }
    }
  };

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="AI-powered grocery management" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-hero opacity-90"></div>
        </div>
        
        {/* Content */}
        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-background/10 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 mb-8">
              <Leaf className="w-4 h-4 text-primary-light" />
              <span className="text-sm font-medium text-primary-foreground">AI-Powered Sustainability</span>
            </div>
            
            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
              Stop Food Waste,
              <br />
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                Start Saving
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Stocky uses AI image recognition to help businesses manage inventory smarter, 
              reduce waste, and offer consumers affordable food through dynamic pricing.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mb-12 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-light mb-1">1.3B</div>
                <div className="text-sm text-primary-foreground/80">Tons wasted yearly</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-light mb-1">€143B</div>
                <div className="text-sm text-primary-foreground/80">Lost in Europe</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-light mb-1">35%</div>
                <div className="text-sm text-primary-foreground/80">Price increases</div>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                variant="hero" 
                size="lg" 
                className="min-w-48"
                onClick={handleGetStarted}
              >
                <Smartphone className="w-5 h-5" />
                {user ? 'Go to Dashboard' : 'Get Started Free'}
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="glass" size="lg" className="min-w-48">
                Watch Demo
              </Button>
            </div>
            
            {user && (
              <div className="mt-4 text-primary-foreground/80">
                Welcome back, {user.firstName}! 👋
              </div>
            )}
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary-foreground/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-primary-foreground/50 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      {showAuthModal && <AuthModal />}
    </>
  );
}