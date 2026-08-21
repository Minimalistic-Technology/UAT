import { useRouter } from '@/lib/router';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ScrollProgress } from '@/components/ScrollProgress';
import { Home } from '@/pages/Home';
import { Products } from '@/pages/Products';
import { About } from '@/pages/About';
import { Contact } from '@/pages/Contact';

function App() {
  const { path, navigate } = useRouter();

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollProgress />
      <Header current={path} navigate={navigate} />
      <main className="flex-1">
        {path === '/' && <Home navigate={navigate} />}
        {path === '/products' && <Products navigate={navigate} />}
        {path === '/about' && <About navigate={navigate} />}
        {path === '/contact' && <Contact />}
      </main>
      <Footer navigate={navigate} />
    </div>
  );
}

export default App;
