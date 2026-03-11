import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import styles from './Loader.module.css';

function Loader() {
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef(null);
  const lineRef = useRef(null);
  const lettersRef = useRef([]);

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(
      lettersRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.05, duration: 0.5, ease: 'power3.out' }
    )
    .fromTo(
      lineRef.current,
      { scaleX: 0, transformOrigin: 'left center' },
      { scaleX: 1, duration: 0.8, ease: 'power2.inOut' },
      '-=0.3'
    )
    .to({}, { duration: 0.5 })
    .to(containerRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.inOut',
      onComplete: () => setIsVisible(false)
    });
  }, []);

  if (!isVisible) return null;

  const text = 'Kandy Breeze';

  return (
    <div ref={containerRef} className={styles.loader}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          {text.split('').map((letter, index) => (
            <span
              key={index}
              ref={el => lettersRef.current[index] = el}
              className={styles.letter}
              style={{ display: letter === ' ' ? 'inline' : 'inline-block' }}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </span>
          ))}
        </h1>
        <div ref={lineRef} className={styles.line}></div>
      </div>
    </div>
  );
}

export default Loader;
