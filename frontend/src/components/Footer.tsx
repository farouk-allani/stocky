import { Button } from "@/components/ui/button";
import { Leaf, Mail, ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        {/* CTA Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Stop Food Waste?
          </h2>
          <p className="text-xl text-background/80 mb-8 max-w-2xl mx-auto">
            Join the sustainability revolution. Start reducing waste and saving money today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="glass" size="lg">
              <Mail className="w-5 h-5" />
              Contact Sales
            </Button>
          </div>
        </div>
        
        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Leaf className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold">Stocky</span>
            </div>
            <p className="text-background/70 mb-4">
              AI-powered stock management for a sustainable future.
            </p>
            <p className="text-sm text-background/60">
              Reducing food waste, one photo at a time.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-background/70">
              <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">API</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Integrations</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-background/70">
              <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-background/70">
              <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-background/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-background/60 text-sm mb-4 md:mb-0">
            © 2024 Stocky. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-sm text-background/60">Built on</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-secondary rounded"></div>
              <span className="text-sm font-semibold">Hedera</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}