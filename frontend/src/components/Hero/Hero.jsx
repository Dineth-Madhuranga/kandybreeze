import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './Hero.module.css';

gsap.registerPlugin(ScrollTrigger);


function Hero() {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const badgeRef = useRef(null);
  const wordsRef = useRef([]);
  const subRef = useRef(null);
  const buttonsRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 2.2 });

      tl.fromTo(
        badgeRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
      )
        .fromTo(
          wordsRef.current,
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: 'power3.out' },
          '-=0.3'
        )
        .fromTo(
          subRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
          '-=0.4'
        )
        .fromTo(
          buttonsRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
          '-=0.3'
        );

      gsap.to(contentRef.current, {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const headlineWords = ['Where', 'the', 'Night', 'Comes', 'Alive'];

  return (
    <section ref={sectionRef} id="hero" className={styles.hero}>
      <div className={styles.heroBg}></div>
      <div className={styles.noise}></div>

      <div className={styles.batikPattern}></div>

      <div ref={contentRef} className={styles.content}>
        <h1 className={styles.headline}>
          {headlineWords.map((word, index) => (
            <span
              key={index}
              ref={el => wordsRef.current[index] = el}
              className={styles.word}
            >
              {word}
            </span>
          ))}
        </h1>

        <p ref={subRef} className={styles.subheadline}>
          7:00 PM – Midnight &middot; Free Entry &middot; Live Music &middot; Cultural Shows
        </p>

        <div ref={buttonsRef} className={styles.buttons}>
          <button
            className={`${styles.btn} ${styles.btnOutline}`}
            onClick={() => scrollToSection('about')}
          >
            Explore the Event
          </button>
          <button
            className={`${styles.btn} ${styles.btnCoral}`}
            onClick={() => scrollToSection('booking')}
          >
            Book a Stall
          </button>
        </div>

        <p className={styles.freeEntry}>Free Entry for All Visitors</p>
      </div>
    </section>
  );
}

export default Hero;
