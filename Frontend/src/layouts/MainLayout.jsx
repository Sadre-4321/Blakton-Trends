import { Outlet } from 'react-router-dom';
import BackToTopButton from '../components/common/BackToTopButton';
import Footer from '../components/common/Footer';
import Navbar from '../components/common/Navbar';

const MainLayout = () => (
  <div className="relative flex min-h-screen flex-col">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
    <BackToTopButton />
  </div>
);

export default MainLayout;
