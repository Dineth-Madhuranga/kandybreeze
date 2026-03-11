import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useBookingWindow } from '../../hooks/useBookingWindow';
import api from '../../utils/api';
import Toast from '../UI/Toast';
import styles from './BookingForm.module.css';

gsap.registerPlugin(ScrollTrigger);

function BookingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const {
    formattedNextSaturday
  } = useBookingWindow();

  const { register, handleSubmit, reset, formState: { errors = {} } } = useForm();

  useEffect(() => {
    if (submitStatus === 'success') {
      gsap.fromTo(
        '.toast',
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }
      );
    }
  }, [submitStatus]);

  const onSubmit = async (data) => {

    setIsSubmitting(true);

    try {
      const response = await api.post('/api/bookings', {
        ...data,
        numberOfStalls: parseInt(data.numberOfStalls) || 1
      });

      if (response.data.success) {
        setSubmitStatus('success');
        setToastMessage('🎉 Booking submitted! We\'ll be in touch soon.');
        reset();
      } else {
        setSubmitStatus('error');
        setToastMessage(response.data.message || 'Something went wrong');
      }
    } catch (error) {
      setSubmitStatus('error');
      setToastMessage(error.response?.data?.message || 'Server error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeToast = () => {
    setSubmitStatus(null);
    setToastMessage('');
  };

  return (
    <section id="booking" className={styles.booking}>
      <div className={styles.batikBg}></div>

      <div className={styles.container}>
        <h2 className={styles.heading}>Book Your Stall at Kandy Breeze</h2>

        <div className={styles.bannerSuccess}>
          <div className={styles.bannerIcon}>✅</div>
          <div className={styles.bannerContent}>
            <p className={styles.bannerTitle}>Bookings are open!</p>
            <p className={styles.bannerText}>
              Submit your request for <strong>{formattedNextSaturday}</strong>
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className={styles.form}
        >
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Full Name *</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Your full name"
                {...register('fullName', {
                  required: 'Full name is required',
                  minLength: { value: 2, message: 'Minimum 2 characters' }
                })}
              />
              {errors.fullName && <span className={styles.error}>{errors.fullName.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Email Address *</label>
              <input
                type="email"
                className={styles.input}
                placeholder="your@email.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' }
                })}
              />
              {errors.email && <span className={styles.error}>{errors.email.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Phone Number *</label>
              <input
                type="tel"
                className={styles.input}
                placeholder="+94 XX XXX XXXX"
                {...register('phone', {
                  required: 'Phone number is required',
                  minLength: { value: 9, message: 'Minimum 9 digits' }
                })}
              />
              {errors.phone && <span className={styles.error}>{errors.phone.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Business / Stall Name *</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Your stall name"
                {...register('stallName', { required: 'Stall name is required' })}
              />
              {errors.stallName && <span className={styles.error}>{errors.stallName.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Stall Type *</label>
              <select
                className={styles.select}
                {...register('stallType', { required: 'Stall type is required' })}
              >
                <option value="" disabled>-- Select Stall Type --</option>
                <option value="Food Stall">Food Stall</option>
                <option value="General / Shopping Stall">General / Shopping Stall</option>
                <option value="Handicraft Stall">Handicraft Stall</option>
                <option value="Beverage Stall">Beverage Stall</option>
                <option value="Other">Other</option>
              </select>
              {errors.stallType && <span className={styles.error}>{errors.stallType.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Number of Stalls</label>
              <input
                type="number"
                className={styles.input}
                min="1"
                max="5"
                defaultValue="1"
                {...register('numberOfStalls', {
                  min: { value: 1, message: 'Minimum 1 stall' },
                  max: { value: 5, message: 'Maximum 5 stalls' }
                })}
              />
              {errors.numberOfStalls && <span className={styles.error}>{errors.numberOfStalls.message}</span>}
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Special Requirements</label>
              <textarea
                className={styles.textarea}
                rows="4"
                placeholder="Any special requirements or requests..."
                {...register('specialRequirements', { maxLength: 500 })}
              />
              {errors.specialRequirements && <span className={styles.error}>{errors.specialRequirements.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Target Date</label>
              <input
                type="text"
                className={styles.input}
                value={formattedNextSaturday}
                readOnly
                disabled
              />
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  {...register('agreement', { required: 'You must agree to continue' })}
                />
                <span>
                  I understand that my booking is subject to approval and the Kandy Breeze team will contact me.
                </span>
              </label>
              {errors.agreement && <span className={styles.error}>{errors.agreement.message}</span>}
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className={styles.spinner}></span>
                Submitting...
              </>
            ) : (
              'Submit Booking Request'
            )}
          </button>
        </form>
      </div>

      {submitStatus && (
        <Toast
          message={toastMessage}
          type={submitStatus}
          onClose={closeToast}
        />
      )}
    </section>
  );
}

export default BookingForm;
