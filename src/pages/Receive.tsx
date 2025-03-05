
import Navbar from '@/components/Navbar';
import ReceiveForm from '@/components/ReceiveForm';

const Receive = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 animate-fade-in">
        <div className="container app-container">
          <ReceiveForm />
        </div>
      </main>
    </div>
  );
};

export default Receive;
