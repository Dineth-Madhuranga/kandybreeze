import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useGSAP() {
  const triggersRef = useRef([]);

  useEffect(() => {
    const cursor = document.getElementById('cursor');
    if (!cursor) return;

    const handleMouseMove = (e) => {
      gsap.to(cursor, {
        x: e.clientX - 6,
        y: e.clientY - 6,
        duration: 0.1,
        ease: 'power2.out'
      });
    };

    const handleMouseEnter = () => {
      gsap.to(cursor, { scale: 2, duration: 0.2 });
    };

    const handleMouseLeave = () => {
      gsap.to(cursor, { scale: 1, duration: 0.2 });
    };

    window.addEventListener('mousemove', handleMouseMove);

    const interactiveElements = document.querySelectorAll('a, button, [role="button"]');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  const createScrollTrigger = (element, config) => {
    const trigger = ScrollTrigger.create({
      trigger: element,
      ...config
    });
    triggersRef.current.push(trigger);
    return trigger;
  };

  useEffect(() => {
    return () => {
      triggersRef.current.forEach(trigger => trigger.kill());
      triggersRef.current = [];
    };
  }, []);

  return { gsap, ScrollTrigger, createScrollTrigger };
}

export default useGSAP;
