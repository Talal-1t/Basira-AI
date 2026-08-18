import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import AmbientBackground from '../components/common/AmbientBackground.jsx';
import Hero from '../components/hero/Hero.jsx';
import UploadArea from '../components/upload/UploadArea.jsx';
import MyFiles from '../components/upload/MyFiles.jsx';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-bg text-text">
      <AmbientBackground />
      <Navbar />
      <main>
        <Hero />
        <UploadArea />
        <MyFiles />
      </main>
      <Footer />
    </div>
  );
}
