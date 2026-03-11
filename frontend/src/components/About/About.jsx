import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './About.module.css';

gsap.registerPlugin(ScrollTrigger);

function About() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const textRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );

      gsap.fromTo(
        textRefs.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: textRefs.current[0],
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="about" className={styles.about}>
      <div className={styles.templeSilhouette}>
        <svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M400 50L350 120H450L400 50Z" fill="currentColor" />
          <rect x="380" y="120" width="40" height="80" fill="currentColor" />
          <path d="M320 180L400 100L480 180V400H320V180Z" fill="currentColor" />
          <path d="M280 200L320 160V400H280V200Z" fill="currentColor" />
          <path d="M480 160L520 200V400H480V160Z" fill="currentColor" />
          <rect x="360" y="220" width="30" height="40" rx="15" fill="currentColor" opacity="0.3" />
          <rect x="410" y="220" width="30" height="40" rx="15" fill="currentColor" opacity="0.3" />
          <path d="M200 250L250 200V400H200V250Z" fill="currentColor" />
          <path d="M550 200L600 250V400H550V200Z" fill="currentColor" />
          <path d="M150 280L200 240V400H150V280Z" fill="currentColor" />
          <path d="M600 240L650 280V400H600V240Z" fill="currentColor" />
          <rect x="100" y="350" width="600" height="50" fill="currentColor" />
        </svg>
      </div>

      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.leftColumn}>
            <span className={styles.label}>About the Event</span>
            <h2 ref={headingRef} className={styles.heading}>
              A Night Market Like No Other
            </h2>

            <p ref={el => textRefs.current[0] = el} className={styles.text}>
              Every Saturday night in the heart of Kandy, Kandy Breeze transforms the city into a
              glowing celebration of local culture, street food, live music, and handmade crafts.
            </p>

            <p ref={el => textRefs.current[1] = el} className={styles.text}>
              Whether you're a local or a traveller, come discover what makes Kandy truly magical —
              entry is completely free for all visitors.
            </p>

            <div className={styles.lotusDivider}>
              <svg viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 5C45 15 35 20 25 15C30 25 40 28 50 25C60 28 70 25 75 15C65 20 55 15 50 5Z" fill="currentColor" />
                <circle cx="50" cy="12" r="4" fill="currentColor" />
                <line x1="0" y1="15" x2="20" y2="15" stroke="currentColor" strokeWidth="1" />
                <line x1="80" y1="15" x2="100" y2="15" stroke="currentColor" strokeWidth="1" />
              </svg>
            </div>
          </div>

          <div className={styles.rightColumn}>
            <div className={styles.rightInner}>
              <div className={styles.aboutImgWrap}>
                <img
                  src="/images/lantern_crowd.jpg"
                  alt="Kandy Breeze lantern night"
                  className={styles.aboutImg}
                />
                <div className={styles.aboutImgBadge}>Every Saturday · Kandy</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
