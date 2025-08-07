import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import {
  ArrowRight,
  Store,
  Search,
  CreditCard,
  Leaf,
  BarChart3,
  CheckCircle,
  Users,
  Globe,
  Smartphone,
  ArrowDown,
  Shield,
} from "lucide-react";

export function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-green-100 text-green-800">
            <Leaf className="w-4 h-4 mr-2" />
            How Stocky Works
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            From Food Waste to
            <br />
            Carbon Credits
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Discover how our AI-powered platform transforms surplus food into
            environmental impact, connecting businesses and consumers while
            generating verified carbon credits.
          </p>
          <div className="flex justify-center">
            <ArrowDown className="w-6 h-6 text-green-600 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Process Overview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">The Complete Process</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform creates a seamless ecosystem where waste becomes
              value
            </p>
          </div>

          {/* Process Steps */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Step 1: Business Registration */}
            <Card className="relative">
              <div className="absolute -top-4 left-6">
                <Badge className="bg-blue-600 text-white text-lg px-4 py-2">
                  01
                </Badge>
              </div>
              <CardHeader className="pt-8">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Store className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-blue-800">
                  Business Lists Surplus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Restaurants, grocery stores, and food businesses list surplus
                  inventory that would otherwise go to waste.
                </p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Real-time inventory tracking
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Automated pricing suggestions
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Blockchain product registration
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Step 2: Consumer Discovery */}
            <Card className="relative">
              <div className="absolute -top-4 left-6">
                <Badge className="bg-green-600 text-white text-lg px-4 py-2">
                  02
                </Badge>
              </div>
              <CardHeader className="pt-8">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-green-800">
                  Consumers Discover Deals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Consumers find discounted, quality food near them through our
                  AI-powered recommendation system.
                </p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Location-based search
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Personalized recommendations
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Real-time availability
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Step 3: Blockchain Transaction */}
            <Card className="relative">
              <div className="absolute -top-4 left-6">
                <Badge className="bg-purple-600 text-white text-lg px-4 py-2">
                  03
                </Badge>
              </div>
              <CardHeader className="pt-8">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-purple-800">
                  Secure Blockchain Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Transactions are processed securely through Hedera Hashgraph
                  using MetaMask wallet integration.
                </p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    MetaMask integration
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Instant settlement
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Transparent tracking
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Arrow Flow */}
          <div className="flex justify-center items-center space-x-4 mb-16">
            <div className="w-8 h-1 bg-gradient-to-r from-blue-400 to-green-400"></div>
            <ArrowRight className="w-6 h-6 text-green-600" />
            <div className="w-8 h-1 bg-gradient-to-r from-green-400 to-purple-400"></div>
            <ArrowRight className="w-6 h-6 text-purple-600" />
            <div className="w-8 h-1 bg-gradient-to-r from-purple-400 to-emerald-400"></div>
          </div>
        </div>
      </section>

      {/* Guardian Integration */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-emerald-100 text-emerald-800">
                <Shield className="w-4 h-4 mr-2" />
                Hedera Guardian Integration
              </Badge>
              <h2 className="text-3xl font-bold mb-6">
                Automatic Carbon Credit Generation
              </h2>
              <p className="text-muted-foreground mb-6">
                Every food rescue transaction automatically triggers Hedera
                Guardian's MRV (Measurement, Reporting, Verification) process to
                generate verified carbon credits.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mt-1" />
                  <div>
                    <h4 className="font-semibold">Automated MRV Process</h4>
                    <p className="text-sm text-muted-foreground">
                      Measurement, Reporting, and Verification happens
                      automatically
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mt-1" />
                  <div>
                    <h4 className="font-semibold">Verified Carbon Credits</h4>
                    <p className="text-sm text-muted-foreground">
                      Credits are verified by Guardian's auditable framework
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mt-1" />
                  <div>
                    <h4 className="font-semibold">ESG Compliance</h4>
                    <p className="text-sm text-muted-foreground">
                      Automated reporting for corporate sustainability goals
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <h3 className="text-xl font-bold mb-6 text-center">
                Live Impact Metrics
              </h3>

              <div className="space-y-4">
                <div className="bg-emerald-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-emerald-700 font-medium">
                      CO₂ Emissions Saved
                    </span>
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-800">
                    1,247 tons
                  </div>
                  <div className="text-emerald-600 text-sm">
                    +23% this month
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-700 font-medium">
                      Food Waste Diverted
                    </span>
                    <Leaf className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-800">
                    2,891 kg
                  </div>
                  <div className="text-blue-600 text-sm">
                    Verified by Guardian
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-purple-700 font-medium">
                      Carbon Credits Generated
                    </span>
                    <Globe className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-purple-800">456</div>
                  <div className="text-purple-600 text-sm">
                    Ready for trading
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Built on Cutting-Edge Technology
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform leverages the latest in blockchain, AI, and
              sustainable technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <img
                  src="/whbar.png"
                  alt="Hedera"
                  className="w-12 h-12 mx-auto mb-4"
                />
                <CardTitle className="text-lg">Hedera Hashgraph</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Fast, secure, and energy-efficient blockchain infrastructure
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Hedera Guardian</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Trusted framework for carbon credit verification and ESG
                  compliance
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">MetaMask</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Seamless wallet integration for secure blockchain transactions
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">AI Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Smart recommendations and automated pricing optimization
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Target Audiences */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Who Benefits from Stocky?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform creates value for multiple stakeholders in the food
              ecosystem
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Store className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">For Businesses</h3>
                  <p className="text-muted-foreground">
                    Restaurants, grocery stores, food retailers
                  </p>
                </div>
              </div>

              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Reduce food waste disposal costs</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Generate revenue from surplus inventory</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Earn verified carbon credits</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Meet ESG compliance requirements</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Improve brand sustainability image</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">For Consumers</h3>
                  <p className="text-muted-foreground">
                    Eco-conscious individuals and families
                  </p>
                </div>
              </div>

              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Access quality food at discounted prices</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Contribute to environmental sustainability</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Track personal environmental impact</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Earn eco-impact scores and rewards</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Support local businesses</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Make an Impact?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses and consumers already reducing food
            waste and earning carbon credits through Stocky.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-green-600 hover:bg-green-50"
            >
              Get Started Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-green-600"
              onClick={() =>
                window.open(
                  "https://www.youtube.com/watch?v=HVZ_fhclLZA",
                  "_blank"
                )
              }
            >
              Watch Demo Video
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
