
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Wallet, Send, ArrowDownToLine, RefreshCw, Home } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for transparent navbar
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <Home className="h-5 w-5" />,
    },
    {
      label: 'Send',
      href: '/send',
      icon: <Send className="h-5 w-5" />,
    },
    {
      label: 'Receive',
      href: '/receive',
      icon: <ArrowDownToLine className="h-5 w-5" />,
    },
    {
      label: 'Convert',
      href: '/convert',
      icon: <RefreshCw className="h-5 w-5" />,
    },
  ];

  const isLandingPage = location.pathname === '/';

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-spring py-4',
        {
          'bg-background/80 backdrop-blur-md shadow-sm': scrolled || !isLandingPage,
          'bg-transparent': !scrolled && isLandingPage,
        }
      )}
    >
      <div className="container flex h-14 items-center">
        <Link to="/" className="flex items-center gap-2 mr-6">
          <Wallet className="h-8 w-8 text-primary" />
          <span className="font-semibold text-lg tracking-tight">Fusion Pay</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 mx-6">
          {!isLandingPage && navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'text-sm font-medium transition-colors flex items-center gap-1.5',
                location.pathname === item.href
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {isLandingPage ? (
            <>
              <Button asChild variant="ghost">
                <Link to="/dashboard">Log in</Link>
              </Button>
              <Button asChild>
                <Link to="/dashboard">Get Started</Link>
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" className="rounded-full">
              <Wallet className="mr-2 h-4 w-4" />
              <span className="font-medium">ID: 7829F3A</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
