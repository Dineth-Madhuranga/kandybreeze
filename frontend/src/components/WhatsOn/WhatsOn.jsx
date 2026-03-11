import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './WhatsOn.module.css';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    emoji: '🍛',
    image: '/images/food_market.jpg',
    title: 'Food Stalls',
    description: 'Authentic Sri Lankan cuisine, kottu, hoppers, seafood, and international street food'
  },
  {
    emoji: '🛍️',
    image: '/images/vendor_stall.jpg',
    title: 'Shopping Stalls',
    description: 'Handmade crafts, batik fashion, souvenirs, gems, and local artisan goods'
  },
  {
    emoji: '🎵',
    image: '/images/dj_crowd.jpg',
    title: 'Live Music',
    description: 'Local bands and solo artists perform every Saturday. Completely free for all visitors.'
  },
  {
    emoji: '💃',
    image: '/images/culture_dance.jpg',
    title: 'Cultural Shows',
    description: 'Traditional Kandyan dance, drumming performances, and cultural displays. Free entry.'
  }
];

function WhatsOn() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const cardsRef = useRef([]);

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

      cardsRef.current.forEach((card, index) => {
        gsap.fromTo(
          card,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            delay: index * 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleMouseMove = (e, index) => {
    const card = cardsRef.current[index];
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const tiltX = ((e.clientY - centerY) / (rect.height / 2)) * -10;
    const tiltY = ((e.clientX - centerX) / (rect.width / 2)) * 10;

    gsap.to(card, {
      rotateX: tiltX,
      rotateY: tiltY,
      transformPerspective: 800,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const handleMouseLeave = (index) => {
    const card = cardsRef.current[index];
    if (!card) return;

    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: 'power2.out'
    });
  };

  return (
    <section ref={sectionRef} id="whatson" className={styles.whatson}>
      <div className={styles.container}>
        <h2 ref={headingRef} className={styles.heading}>
          A Night Full of Everything
        </h2>

        <div className={styles.cardsGrid}>
          {features.map((feature, index) => (
            <div
              key={index}
              ref={el => cardsRef.current[index] = el}
              className={styles.card}
              onMouseMove={(e) => handleMouseMove(e, index)}
              onMouseLeave={() => handleMouseLeave(index)}
              style={{
                transformStyle: 'preserve-3d',
                backgroundImage: `url(${feature.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className={styles.cardMask} />
              <div className={styles.cardBody}>
                <div className={styles.iconWrapper}>
                  <span className={styles.icon}>{feature.emoji}</span>
                </div>
                <h3 className={styles.cardTitle}>{feature.title}</h3>
                <p className={styles.cardDescription}>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhatsOn;
