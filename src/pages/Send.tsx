
import Navbar from '@/components/Navbar';
import SendForm from '@/components/SendForm';

const Send = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 animate-fade-in">
        <div className="container app-container">
          <SendForm />
        </div>
      </main>
    </div>
  );
};

export default Send;
