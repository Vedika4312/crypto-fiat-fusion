
import Navbar from '@/components/Navbar';
import CurrencyConverter from '@/components/CurrencyConverter';

const Convert = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 animate-fade-in">
        <div className="container app-container">
          <CurrencyConverter />
        </div>
      </main>
    </div>
  );
};

export default Convert;
