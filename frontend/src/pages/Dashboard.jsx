import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import api from '../utils/api';
import Toast from '../components/UI/Toast';
import styles from './Dashboard.module.css';

const TABS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'all', label: 'All Bookings', icon: '📋' },
  { id: 'pending', label: 'Pending', icon: '⏳' },
  { id: 'approved', label: 'Approved', icon: '✅' },
  { id: 'rejected', label: 'Not Approved', icon: '❌' }
];

function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    notApproved: 0,
    thisWeek: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [weeks, setWeeks] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('kb-theme');
    return saved ? saved === 'dark' : true;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const statsRef = useRef([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/api/admin/check-auth');
        if (response.data.authenticated) {
          setIsAuthenticated(true);
        } else {
          navigate('/login');
        }
      } catch (err) {
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.removeAttribute('data-theme');
    } else {
      html.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('kb-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/api/admin/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'overview' && activeTab !== 'all') {
        params.append('status', activeTab === 'rejected' ? 'Not Approved' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1));
      }
      if (selectedWeek) {
        params.append('week', selectedWeek);
      }
      params.append('page', page);
      params.append('limit', 20);

      const response = await api.get(`/api/admin/bookings?${params}`);
      setBookings(response.data.bookings);
      setTotalPages(response.data.totalPages);

      const uniqueWeeks = [...new Set(response.data.bookings.map(b => b.weekNumber))].sort((a, b) => b - a);
      setWeeks(uniqueWeeks);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setToast({ show: true, message: 'Failed to load bookings', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, activeTab, selectedWeek, page]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated, fetchStats]);

  useEffect(() => {
    if (isAuthenticated && activeTab !== 'overview') {
      fetchBookings();
    }
  }, [isAuthenticated, activeTab, selectedWeek, page, fetchBookings]);

  useEffect(() => {
    if (activeTab === 'overview' && statsRef.current.length > 0) {
      statsRef.current.forEach((stat, index) => {
        if (stat) {
          gsap.fromTo(
            stat,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, delay: index * 0.1, ease: 'power3.out' }
          );
        }
      });
    }
  }, [activeTab]);

  const handleLogout = async () => {
    try {
      await api.post('/api/admin/logout');
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.patch(`/api/admin/bookings/${id}/status`, { status });
      fetchBookings();
      fetchStats();
      setToast({
        show: true,
        message: `Booking ${status.toLowerCase()} successfully`,
        type: 'success'
      });
      setConfirmAction(null);
      setSelectedBooking(null);
    } catch (err) {
      setToast({
        show: true,
        message: 'Failed to update status',
        type: 'error'
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/admin/bookings/${id}`);
      fetchBookings();
      fetchStats();
      setToast({
        show: true,
        message: 'Booking deleted successfully',
        type: 'success'
      });
      setConfirmAction(null);
      setSelectedBooking(null);
    } catch (err) {
      setToast({
        show: true,
        message: 'Failed to delete booking',
        type: 'error'
      });
    }
  };

  const exportCSV = () => {
    const filteredBookings = bookings.filter(b => {
      const matchesSearch =
        b.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.stallName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    const headers = ['Name', 'Email', 'Phone', 'Stall Name', 'Type', 'Number of Stalls', 'Target Date', 'Submitted', 'Status'];
    const rows = filteredBookings.map(b => [
      b.fullName,
      b.email,
      b.phone,
      b.stallName,
      b.stallType,
      b.numberOfStalls,
      new Date(b.targetSaturday).toLocaleDateString(),
      new Date(b.submittedAt).toLocaleString(),
      b.status
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kandy-breeze-bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch =
      b.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.stallName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className={`${styles.badge} ${styles.badgePending}`}>Pending</span>;
      case 'Approved':
        return <span className={`${styles.badge} ${styles.badgeApproved}`}>Approved</span>;
      case 'Not Approved':
        return <span className={`${styles.badge} ${styles.badgeRejected}`}>Not Approved</span>;
      default:
        return <span className={styles.badge}>{status}</span>;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Mobile top bar */}
      <div className={styles.mobileTopBar}>
        <button
          className={styles.hamburger}
          onClick={() => setIsSidebarOpen(prev => !prev)}
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? '✕' : '☰'}
        </button>
        <div className={styles.mobileLogo}>
          <svg className={styles.logoIcon} viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="15" width="20" height="25" rx="2" fill="#F5A623" />
            <path d="M5 15L20 5L35 15H5Z" fill="#FF5F40" />
            <circle cx="20" cy="27.5" r="6" fill="#FFF8EE" opacity="0.8" />
            <rect x="8" y="40" width="24" height="3" rx="1" fill="#F5A623" />
          </svg>
          <span className={styles.mobileLogoText}>Kandy Breeze</span>
        </div>
        <button className={styles.mobileLogoutBtn} onClick={handleLogout} aria-label="Logout">
          🚪
        </button>
      </div>

      {/* Sidebar overlay */}
      {isSidebarOpen && (
        <div className={styles.sidebarOverlay} onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <svg className={styles.logoIcon} viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="15" width="20" height="25" rx="2" fill="#F5A623" />
            <path d="M5 15L20 5L35 15H5Z" fill="#FF5F40" />
            <circle cx="20" cy="27.5" r="6" fill="#FFF8EE" opacity="0.8" />
            <rect x="8" y="40" width="24" height="3" rx="1" fill="#F5A623" />
          </svg>
          <div>
            <h2 className={styles.logoText}>Kandy Breeze</h2>
            <p className={styles.logoSubtext}>Admin Panel</p>
          </div>
        </div>

        <div className={styles.themeToggleRow}>
          <span className={styles.themeLabel}>
            {isDarkMode ? '🌙 Dark' : '☀️ Light'}
          </span>
          <button
            className={`${styles.themeSwitch} ${isDarkMode ? styles.themeSwitchDark : styles.themeSwitchLight}`}
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <span className={styles.themeSwitchThumb} style={{ transform: `translateX(${isDarkMode ? 22 : 2}px)` }} />
          </button>
        </div>

        <nav className={styles.nav}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`${styles.navItem} ${activeTab === tab.id ? styles.navItemActive : ''}`}
              onClick={() => { setActiveTab(tab.id); setPage(1); setIsSidebarOpen(false); }}
            >
              <span className={styles.navIcon}>{tab.icon}</span>
              <span className={styles.navLabel}>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <p className={styles.userInfo}>Logged in as <strong>MediaAsia</strong></p>

          <button className={styles.logoutBtn} onClick={handleLogout}>
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        {activeTab === 'overview' ? (
          <div className={styles.overview}>
            <h1 className={styles.pageTitle}>Dashboard Overview</h1>

            <div className={styles.statsGrid}>
              <div ref={el => statsRef.current[0] = el} className={`${styles.statCard} ${styles.statBlue}`}>
                <div className={styles.statIcon}>📊</div>
                <div className={styles.statNumber}>{stats.total}</div>
                <div className={styles.statLabel}>Total Bookings</div>
              </div>
              <div ref={el => statsRef.current[1] = el} className={`${styles.statCard} ${styles.statAmber}`}>
                <div className={styles.statIcon}>⏳</div>
                <div className={styles.statNumber}>{stats.pending}</div>
                <div className={styles.statLabel}>Pending Review</div>
              </div>
              <div ref={el => statsRef.current[2] = el} className={`${styles.statCard} ${styles.statGreen}`}>
                <div className={styles.statIcon}>✅</div>
                <div className={styles.statNumber}>{stats.approved}</div>
                <div className={styles.statLabel}>Approved</div>
              </div>
              <div ref={el => statsRef.current[3] = el} className={`${styles.statCard} ${styles.statRed}`}>
                <div className={styles.statIcon}>❌</div>
                <div className={styles.statNumber}>{stats.notApproved}</div>
                <div className={styles.statLabel}>Not Approved</div>
              </div>
            </div>

            <div className={styles.recentSection}>
              <h2 className={styles.sectionTitle}>Recent Bookings</h2>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Stall Name</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 5).map(booking => (
                      <tr key={booking._id} onClick={() => setSelectedBooking(booking)}>
                        <td>{booking.fullName}</td>
                        <td>{booking.stallName}</td>
                        <td>{booking.stallType}</td>
                        <td>{getStatusBadge(booking.status)}</td>
                        <td>{new Date(booking.submittedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.bookingsPage}>
            <h1 className={styles.pageTitle}>
              {TABS.find(t => t.id === activeTab)?.label}
            </h1>

            <div className={styles.toolbar}>
              <div className={styles.searchWrapper}>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Search by name or stall..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className={styles.filterSelect}
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
              >
                <option value="">All Weeks</option>
                {weeks.map(week => (
                  <option key={week} value={week}>Week {week}</option>
                ))}
              </select>

              <button className={styles.exportBtn} onClick={exportCSV}>
                📥 Export CSV
              </button>

              <button className={styles.refreshBtn} onClick={fetchBookings}>
                🔄 Refresh
              </button>
            </div>

            <p className={styles.showingText}>
              Showing {filteredBookings.length} of {bookings.length} bookings
            </p>

            <div className={styles.tableWrapper}>
              {isLoading ? (
                <div className={styles.tableLoading}>
                  <div className={styles.spinner}></div>
                </div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Stall Name</th>
                      <th>Type</th>
                      <th>Stalls</th>
                      <th>Target Date</th>
                      <th>Submitted</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking, index) => (
                      <tr key={booking._id}>
                        <td>{(page - 1) * 20 + index + 1}</td>
                        <td>{booking.fullName}</td>
                        <td>{booking.email}</td>
                        <td>{booking.stallName}</td>
                        <td>{booking.stallType}</td>
                        <td>{booking.numberOfStalls}</td>
                        <td>{new Date(booking.targetSaturday).toLocaleDateString()}</td>
                        <td>{new Date(booking.submittedAt).toLocaleDateString()}</td>
                        <td>{getStatusBadge(booking.status)}</td>
                        <td>
                          <div className={styles.actions}>
                            {booking.status !== 'Approved' && (
                              <button
                                className={`${styles.actionBtn} ${styles.approveBtn}`}
                                onClick={() => setConfirmAction({ type: 'approve', booking })}
                                title="Approve"
                              >
                                ✅
                              </button>
                            )}
                            {booking.status !== 'Not Approved' && (
                              <button
                                className={`${styles.actionBtn} ${styles.rejectBtn}`}
                                onClick={() => setConfirmAction({ type: 'reject', booking })}
                                title="Not Approve"
                              >
                                ❌
                              </button>
                            )}
                            <button
                              className={`${styles.actionBtn} ${styles.deleteBtn}`}
                              onClick={() => setConfirmAction({ type: 'delete', booking })}
                              title="Delete"
                            >
                              🗑️
                            </button>
                            <button
                              className={`${styles.actionBtn} ${styles.viewBtn}`}
                              onClick={() => setSelectedBooking(booking)}
                              title="View Details"
                            >
                              ℹ️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageBtn}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className={`${styles.pageBtn} ${page === p ? styles.pageBtnActive : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className={styles.pageBtn}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {selectedBooking && (
        <div className={styles.modalOverlay} onClick={() => setSelectedBooking(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Booking Details</h3>
              <button className={styles.modalClose} onClick={() => setSelectedBooking(null)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Full Name:</span>
                <span className={styles.detailValue}>{selectedBooking.fullName}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Email:</span>
                <span className={styles.detailValue}>{selectedBooking.email}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Phone:</span>
                <span className={styles.detailValue}>{selectedBooking.phone}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Stall Name:</span>
                <span className={styles.detailValue}>{selectedBooking.stallName}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Stall Type:</span>
                <span className={styles.detailValue}>{selectedBooking.stallType}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Number of Stalls:</span>
                <span className={styles.detailValue}>{selectedBooking.numberOfStalls}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Special Requirements:</span>
                <span className={styles.detailValue}>{selectedBooking.specialRequirements || 'None'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Target Date:</span>
                <span className={styles.detailValue}>{new Date(selectedBooking.targetSaturday).toLocaleDateString()}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Submitted:</span>
                <span className={styles.detailValue}>{new Date(selectedBooking.submittedAt).toLocaleString()}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Status:</span>
                <span className={styles.detailValue}>{getStatusBadge(selectedBooking.status)}</span>
              </div>
            </div>
            <div className={styles.modalFooter}>
              {selectedBooking.status !== 'Approved' && (
                <button
                  className={`${styles.modalBtn} ${styles.modalBtnApprove}`}
                  onClick={() => { setSelectedBooking(null); setConfirmAction({ type: 'approve', booking: selectedBooking }); }}
                >
                  Approve
                </button>
              )}
              {selectedBooking.status !== 'Not Approved' && (
                <button
                  className={`${styles.modalBtn} ${styles.modalBtnReject}`}
                  onClick={() => { setSelectedBooking(null); setConfirmAction({ type: 'reject', booking: selectedBooking }); }}
                >
                  Not Approve
                </button>
              )}
              <button
                className={`${styles.modalBtn} ${styles.modalBtnDelete}`}
                onClick={() => { setSelectedBooking(null); setConfirmAction({ type: 'delete', booking: selectedBooking }); }}
              >
                Delete
              </button>
              <button
                className={`${styles.modalBtn} ${styles.modalBtnClose}`}
                onClick={() => setSelectedBooking(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <div className={styles.modalOverlay} onClick={() => setConfirmAction(null)}>
          <div className={`${styles.modal} ${styles.confirmModal}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Are you sure?</h3>
              <button className={styles.modalClose} onClick={() => setConfirmAction(null)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.confirmText}>
                {confirmAction.type === 'approve' && `Approve booking for "${confirmAction.booking.stallName}"?`}
                {confirmAction.type === 'reject' && `Mark "${confirmAction.booking.stallName}" as not approved?`}
                {confirmAction.type === 'delete' && `Delete booking for "${confirmAction.booking.stallName}"? This action cannot be undone.`}
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={`${styles.modalBtn} ${confirmAction.type === 'delete' ? styles.modalBtnDelete : confirmAction.type === 'approve' ? styles.modalBtnApprove : styles.modalBtnReject}`}
                onClick={() => {
                  if (confirmAction.type === 'approve') handleStatusUpdate(confirmAction.booking._id, 'Approved');
                  if (confirmAction.type === 'reject') handleStatusUpdate(confirmAction.booking._id, 'Not Approved');
                  if (confirmAction.type === 'delete') handleDelete(confirmAction.booking._id);
                }}
              >
                {confirmAction.type === 'delete' ? 'Delete' : confirmAction.type === 'approve' ? 'Approve' : 'Not Approve'}
              </button>
              <button
                className={`${styles.modalBtn} ${styles.modalBtnClose}`}
                onClick={() => setConfirmAction(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
}

export default Dashboard;
