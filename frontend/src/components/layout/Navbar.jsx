import { useEffect, useState } from 'react';
import Logo from '../common/Logo.jsx';
import LanguageSwitch from '../common/LanguageSwitch.jsx';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? 'bg-bg/85 backdrop-blur-md border-b border-border' : 'bg-transparent border-b border-transparent'
      }`}
    >
      <nav className="container-shell flex h-16 items-center justify-between">
        <a href="#top" aria-label="Basira AI home">
          <Logo />
        </a>
        <LanguageSwitch />
      </nav>
    </header>
  );
}
