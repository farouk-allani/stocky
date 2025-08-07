import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Leaf,
  TrendingUp,
  Award,
  Globe,
  CheckCircle,
  BarChart3,
  Verified,
} from "lucide-react";

export function HederaGuardianSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-200">
            <Shield className="w-4 h-4 mr-2" />
            Powered by Hedera Guardian
          </Badge>
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Verified Carbon Impact with Hedera Guardian
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Leveraging industry-leading trust and transparency to create
            auditable carbon markets through verified food waste reduction and
            environmental impact tracking.
          </p>
        </div>

        {/* Guardian Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Verified className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-green-800">
                Verifiable Carbon Credits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Every food rescue transaction generates verified carbon credits
                through Hedera Guardian's auditable framework, ensuring credible
                environmental impact.
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-green-800">
                Real-time Impact Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Monitor CO₂ emissions saved, waste diverted, and carbon
                footprint reduction with transparent, blockchain-verified
                metrics and reporting.
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-green-800">
                Global ESG Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Meet ESG reporting requirements with Guardian's standardized
                carbon accounting and automated compliance reporting for
                businesses.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Guardian Integration Showcase */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">
            <div className="p-8 lg:p-12">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Hedera Guardian Integration
                  </h3>
                  <p className="text-green-600 font-medium">
                    Trusted Carbon Market Infrastructure
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Automated MRV (Measurement, Reporting, Verification)
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Every food rescue automatically triggers Guardian's MRV
                      process, creating verified carbon offset records.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Immutable Impact Ledger
                    </h4>
                    <p className="text-gray-600 text-sm">
                      All environmental impact data stored on Hedera's hashgraph
                      with Guardian's policy framework for transparency.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Carbon Credit Marketplace
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Businesses can trade verified carbon credits generated
                      through food waste reduction activities.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      ESG Reporting Dashboard
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Real-time ESG metrics and automated compliance reports for
                      corporate sustainability initiatives.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <Award className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-semibold text-green-800">
                    Industry Recognition
                  </span>
                </div>
                <p className="text-green-700 text-sm">
                  Guardian's trust and transparency framework is recognized by
                  leading carbon registries and environmental organizations
                  worldwide.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 lg:p-12 text-white">
              <h3 className="text-2xl font-bold mb-6">Live Impact Metrics</h3>

              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-100">CO₂ Emissions Saved</span>
                    <TrendingUp className="w-5 h-5 text-green-200" />
                  </div>
                  <div className="text-3xl font-bold">1,247 tons</div>
                  <div className="text-green-200 text-sm">+23% this month</div>
                </div>

                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-100">Food Waste Diverted</span>
                    <Leaf className="w-5 h-5 text-green-200" />
                  </div>
                  <div className="text-3xl font-bold">2,891 kg</div>
                  <div className="text-green-200 text-sm">
                    Verified by Guardian
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-100">
                      Carbon Credits Generated
                    </span>
                    <Award className="w-5 h-5 text-green-200" />
                  </div>
                  <div className="text-3xl font-bold">456</div>
                  <div className="text-green-200 text-sm">
                    Ready for trading
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-white/20 backdrop-blur rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-green-100 mb-1">
                    Guardian Transaction ID
                  </div>
                  <div className="font-mono text-xs bg-black/20 px-2 py-1 rounded">
                    0.0.789012@1691404800.123456789
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold mb-4">
            Ready to Create Verified Environmental Impact?
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the transparent carbon market revolution powered by Hedera
            Guardian's industry-leading trust and verification infrastructure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              <Shield className="w-5 h-5 mr-2" />
              Start Tracking Impact
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              View Guardian Documentation
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
