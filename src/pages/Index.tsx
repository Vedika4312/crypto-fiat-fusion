
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { ArrowRight, CheckCircle, CreditCard, Globe, Lock, Wallet, RefreshCw } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32">
          <div className="absolute inset-0 bg-gradient-subtle from-primary/5 to-transparent -z-10" />
          
          <div className="container max-w-6xl mx-auto px-4 text-center">
            <div className="animate-slide-up">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                The Future of <span className="text-primary">Money</span> is Here
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                Seamlessly manage both traditional currencies and cryptocurrencies in one elegant platform
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/dashboard">
                    Get Started <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/dashboard">
                    View Demo Account
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="mt-16 relative">
              <div className="glass-card rounded-2xl mx-auto max-w-4xl overflow-hidden animate-scale-in">
                <img 
                  src="https://placehold.co/1200x700/F9FAFB/64748b?text=Fusion+Pay+Dashboard+Preview" 
                  alt="Fusion Pay App Dashboard" 
                  className="w-full h-auto"
                />
              </div>
              
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                <div className="flex gap-2 px-4 py-2 bg-background/80 backdrop-blur-sm rounded-full shadow-glass">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm font-medium">Live Demo Available</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Key Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Designed with simplicity and elegance in mind, our platform brings together the best of traditional and crypto finance
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-background rounded-xl p-6 shadow-glass hover:shadow-glass-hover transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Unified Wallet</h3>
                <p className="text-muted-foreground">
                  Manage both fiat and cryptocurrencies in one elegant, unified interface
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className="bg-background rounded-xl p-6 shadow-glass hover:shadow-glass-hover transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Instant Transfers</h3>
                <p className="text-muted-foreground">
                  Send and receive payments instantly with minimal fees and maximum security
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className="bg-background rounded-xl p-6 shadow-glass hover:shadow-glass-hover transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Global Access</h3>
                <p className="text-muted-foreground">
                  Access your funds from anywhere in the world with our secure mobile app
                </p>
              </div>
              
              {/* Feature 4 */}
              <div className="bg-background rounded-xl p-6 shadow-glass hover:shadow-glass-hover transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <RefreshCw className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Currency Conversion</h3>
                <p className="text-muted-foreground">
                  Seamlessly convert between fiat and cryptocurrencies at competitive rates
                </p>
              </div>
              
              {/* Feature 5 */}
              <div className="bg-background rounded-xl p-6 shadow-glass hover:shadow-glass-hover transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Advanced Security</h3>
                <p className="text-muted-foreground">
                  Enterprise-grade security with end-to-end encryption and multi-factor authentication
                </p>
              </div>
              
              {/* Feature 6 */}
              <div className="bg-background rounded-xl p-6 shadow-glass hover:shadow-glass-hover transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Unique User IDs</h3>
                <p className="text-muted-foreground">
                  Simple, secure identifiers make sending and receiving funds as easy as possible
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="bg-primary/5 rounded-2xl p-8 md:p-12">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
                <p className="text-muted-foreground mb-8">
                  Join thousands of users who are already experiencing the future of finance
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button asChild size="lg">
                    <Link to="/dashboard">Create Account</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/dashboard">Learn More</Link>
                  </Button>
                </div>
                
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>No hidden fees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Cancel anytime</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>24/7 support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-muted/30 py-10">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Wallet className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">Fusion Pay</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8">
              <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
          
          <div className="mt-8 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Fusion Pay. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
