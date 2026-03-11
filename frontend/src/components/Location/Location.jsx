import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './Location.module.css';

gsap.registerPlugin(ScrollTrigger);

const infoItems = [
  { icon: '📍', text: 'Kandy, Central Province, Sri Lanka' },
  { icon: '🕖', text: 'Every Saturday · 7:00 PM – 12:00 Midnight' },
  { icon: '🎟️', text: 'Free Entry for All Visitors' },
  { icon: '🚗', text: 'Parking available nearby' },
  { icon: '📞', text: 'Contact: +94 81 123 4567' },
  { icon: '✉️', text: 'contact@kandybreeze.lk' }
];

function Location() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const mapRef = useRef(null);
  const infoRef = useRef(null);

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
        mapRef.current,
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: mapRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );

      gsap.fromTo(
        infoRef.current,
        { x: 50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: infoRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="location" className={styles.location}>
      <div className={styles.container}>
        <h2 ref={headingRef} className={styles.heading}>
          Find Us in Kandy
        </h2>

        <div className={styles.grid}>
          <div ref={mapRef} className={styles.mapWrapper}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63371.46!2d80.6337!3d7.2906!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae3662db5f6c2e9%3A0x2979d9f7c0e4e7c2!2sKandy%2C%20Sri%20Lanka!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
              width="100%"
              height="100%"
              style={{ border: 0, borderRadius: '12px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Kandy Breeze Location"
            ></iframe>
          </div>

          <div ref={infoRef} className={styles.infoCard}>
            <h3 className={styles.infoHeading}>Event Information</h3>
            <ul className={styles.infoList}>
              {infoItems.map((item, index) => (
                <li key={index} className={styles.infoItem}>
                  <span className={styles.infoIcon}>{item.icon}</span>
                  <span className={styles.infoText}>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Location;
