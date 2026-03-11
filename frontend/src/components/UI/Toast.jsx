import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import styles from './Toast.module.css';

function Toast({ message, type = 'success', onClose }) {
  const toastRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(
      toastRef.current,
      { x: 100, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.4, ease: 'power3.out' }
    );

    const timer = setTimeout(() => {
      gsap.to(toastRef.current, {
        x: 100,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: onClose
      });
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      ref={toastRef}
      className={`${styles.toast} ${type === 'error' ? styles.error : styles.success}`}
    >
      <div className={styles.icon}>
        {type === 'success' ? '✓' : '✕'}
      </div>
      <p className={styles.message}>{message}</p>
      <button className={styles.closeBtn} onClick={onClose}>×</button>
    </div>
  );
}

export default Toast;
