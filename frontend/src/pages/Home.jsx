import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '../components/Navbar/Navbar';
import Hero from '../components/Hero/Hero';
import About from '../components/About/About';
import WhatsOn from '../components/WhatsOn/WhatsOn';
import Schedule from '../components/Schedule/Schedule';
import Gallery from '../components/Gallery/Gallery';
import BookingForm from '../components/BookingForm/BookingForm';
import Location from '../components/Location/Location';
import Footer from '../components/Footer/Footer';

gsap.registerPlugin(ScrollTrigger);

function Home() {
  useEffect(() => {
    ScrollTrigger.refresh();
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <WhatsOn />
        <Schedule />
        <Gallery />
        <BookingForm />
        <Location />
      </main>
      <Footer />
    </>
  );
}

export default Home;
