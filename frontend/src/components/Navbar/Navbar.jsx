import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import styles from './Navbar.module.css';

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    handleScroll(); // run immediately on mount → forces a re-render that fixes layout
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuRef.current) {
      if (isMobileMenuOpen) {
        gsap.fromTo(
          mobileMenuRef.current,
          { height: 0, opacity: 0 },
          { height: 'auto', opacity: 1, duration: 0.3, ease: 'power2.out' }
        );
      } else {
        gsap.to(mobileMenuRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in'
        });
      }
    }
  }, [isMobileMenuOpen]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'Home', id: 'hero' },
    { label: 'About', id: 'about' },
    { label: 'Events', id: 'whatson' },
    { label: 'Stalls', id: 'booking' },
    { label: 'Book a Stall', id: 'booking', isCta: true }
  ];

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <a href="#hero" className={styles.logo} onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}>
          <span className={styles.logoText}>Kandy Breeze</span>
        </a>

        <ul className={styles.navLinks}>
          {navLinks.slice(0, 4).map((link) => (
            <li key={link.id + link.label}>
              <a
                href={`#${link.id}`}
                className={styles.navLink}
                onClick={(e) => { e.preventDefault(); scrollToSection(link.id); }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#booking"
          className={styles.ctaButton}
          onClick={(e) => { e.preventDefault(); scrollToSection('booking'); }}
        >
          Book a Stall
        </a>

        <button
          className={styles.hamburger}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      <div ref={mobileMenuRef} className={styles.mobileMenu} style={{ height: 0, overflow: 'hidden' }}>
        {navLinks.map((link) => (
          <a
            key={link.id + link.label + 'mobile'}
            href={`#${link.id}`}
            className={`${styles.mobileLink} ${link.isCta ? styles.mobileCta : ''}`}
            onClick={(e) => { e.preventDefault(); scrollToSection(link.id); }}
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

export default Navbar;
