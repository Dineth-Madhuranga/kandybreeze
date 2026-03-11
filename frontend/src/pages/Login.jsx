import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import api from '../utils/api';
import Toast from '../components/UI/Toast';
import styles from './Login.module.css';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  const cardRef = useRef(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/api/admin/check-auth');
        if (response.data.authenticated) {
          navigate('/dashboard');
        }
      } catch (err) {
        // Not authenticated, stay on login page
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (!isCheckingAuth && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { y: 40, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' }
      );
    }
  }, [isCheckingAuth]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/api/admin/login', { username, password });
      
      if (response.data.success) {
        navigate('/dashboard');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.login}>
      <div className={styles.noise}></div>
      
      <div ref={cardRef} className={styles.card}>
        <div className={styles.logo}>
          <svg className={styles.lanternIcon} viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="15" width="20" height="25" rx="2" fill="#F5A623"/>
            <path d="M5 15L20 5L35 15H5Z" fill="#FF5F40"/>
            <circle cx="20" cy="27.5" r="6" fill="#FFF8EE" opacity="0.8"/>
            <rect x="8" y="40" width="24" height="3" rx="1" fill="#F5A623"/>
          </svg>
          <h1 className={styles.title}>Kandy Breeze</h1>
        </div>
        
        <p className={styles.subtitle}>Admin Access</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Username</label>
            <input
              type="text"
              className={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                className={styles.toggleBtn}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className={styles.btnSpinner}></span>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <a href="/" className={styles.backLink}>
          &larr; Back to Website
        </a>
      </div>

      {error && (
        <Toast
          message={error}
          type="error"
          onClose={() => setError('')}
        />
      )}
    </div>
  );
}

export default Login;
