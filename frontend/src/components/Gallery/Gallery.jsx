import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './Gallery.module.css';

gsap.registerPlugin(ScrollTrigger);

const galleryItems = [
  {
    image: '/images/night_market.jpg',
    height: 280,
    caption: 'Vibrant Night Atmosphere'
  },
  {
    image: '/images/vendor_stall.jpg',
    height: 200,
    caption: 'Local Artisans at Work'
  },
  {
    image: '/images/culture_dance.jpg',
    height: 250,
    caption: 'Traditional Kandyan Dance'
  },
  {
    image: '/images/food_market.jpg',
    height: 220,
    caption: 'Delicious Street Food'
  },
  {
    image: '/images/dj_crowd.jpg',
    height: 300,
    caption: 'Live Music Performances'
  },
  {
    image: '/images/friends_group.jpg',
    height: 180,
    caption: 'Community Gathering'
  }
];

function Gallery() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const itemsRef = useRef([]);

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

      itemsRef.current.forEach((item, index) => {
        gsap.fromTo(
          item,
          { scale: 0.85, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.6,
            delay: index * 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="gallery" className={styles.gallery}>
      <div className={styles.container}>
        <h2 ref={headingRef} className={styles.heading}>
          The Kandy Breeze Vibe
        </h2>

        <div className={styles.masonryGrid}>
          {galleryItems.map((item, index) => (
            <div
              key={index}
              ref={el => itemsRef.current[index] = el}
              className={styles.item}
              style={{ height: `${item.height}px` }}
            >
              <img
                src={item.image}
                alt={item.caption}
                className={styles.itemImg}
              />
              <div className={styles.overlay}>
                <p className={styles.caption}>{item.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Gallery;
