import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './Schedule.module.css';

gsap.registerPlugin(ScrollTrigger);

const scheduleItems = [
  { time: '7:00 PM', title: 'Gates Open', description: 'Stalls open, browse food and shopping', icon: '🚪' },
  { time: '8:00 PM', title: 'Live Music Begins', description: 'Bands and solo acts take the main stage', icon: '🎵' },
  { time: '9:00 PM', title: 'Cultural Show', description: 'Traditional Kandyan dance performance', icon: '💃' },
  { time: '10:30 PM', title: 'Special Highlight', description: 'Guest performers and special surprises', icon: '⭐' },
  { time: '12:00 AM', title: 'Night Ends', description: 'Until next Saturday!', icon: '🌙' }
];

function Schedule() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const subtextRef = useRef(null);
  const lineRef = useRef(null);
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

      gsap.fromTo(
        subtextRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          delay: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: subtextRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );

      gsap.fromTo(
        lineRef.current,
        { scaleY: 0, transformOrigin: 'top center' },
        {
          scaleY: 1,
          duration: 1.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: lineRef.current,
            start: 'top 70%',
            toggleActions: 'play none none none'
          }
        }
      );

      itemsRef.current.forEach((item, index) => {
        const isEven = index % 2 === 0;
        gsap.fromTo(
          item,
          {
            x: isEven ? -50 : 50,
            opacity: 0
          },
          {
            x: 0,
            opacity: 1,
            duration: 0.6,
            delay: index * 0.15,
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
    <section ref={sectionRef} id="schedule" className={styles.schedule}>
      <div className={styles.container}>
        <h2 ref={headingRef} className={styles.heading}>
          Every Saturday Night
        </h2>
        <p ref={subtextRef} className={styles.subtext}>
          Here's what to expect when you arrive at Kandy Breeze
        </p>

        <div className={styles.timeline}>
          <div ref={lineRef} className={styles.line}></div>

          {scheduleItems.map((item, index) => (
            <div
              key={index}
              ref={el => itemsRef.current[index] = el}
              className={`${styles.item} ${index % 2 === 0 ? styles.left : styles.right}`}
            >
              <div className={styles.dot}></div>
              <div className={styles.content}>
                <div className={styles.card}>
                  <span className={styles.icon}>{item.icon}</span>
                  <h3 className={styles.title}>{item.title}</h3>
                  <p className={styles.description}>{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Schedule;
