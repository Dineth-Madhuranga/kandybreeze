# Kandy Breeze - Saturday Night Market

## Features

- **Landing Page**: Stunning React.js frontend with GSAP animations
- **Stall Booking System**: Sunday-only booking window with real-time validation
- **Admin Dashboard**: Full-featured management interface for bookings
- **Email Notifications**: Automated emails for bookings and status updates
- **Mobile Responsive**: Fully responsive from 320px to 1920px

## Tech Stack

### Frontend
- React.js (Vite)
- GSAP + ScrollTrigger for animations
- React Router v6
- Axios for API calls
- React Hook Form for validation
- Pure CSS Modules (no Tailwind/Bootstrap)

### Backend
- Node.js + Express.js
- MongoDB Atlas with Mongoose ODM
- Nodemailer for email notifications
- Express-session for authentication

## Folder Structure

```
kandy-breeze/
├── backend/
│   ├── server.js
│   ├── .env
│   ├── models/
│   │   └── Booking.js
│   ├── routes/
│   │   ├── bookingRoutes.js
│   │   └── adminRoutes.js
│   └── middleware/
│       └── authMiddleware.js
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── components/
│       │   ├── Navbar/
│       │   ├── Hero/
│       │   ├── About/
│       │   ├── WhatsOn/
│       │   ├── Schedule/
│       │   ├── Gallery/
│       │   ├── BookingForm/
│       │   ├── Location/
│       │   ├── Footer/
│       │   └── UI/
│       ├── pages/
│       ├── hooks/
│       └── utils/
└── README.md
```

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas free tier account
- Gmail account with App Password enabled

## Setup Instructions

### 1. Clone/Create Project

```bash
cd kandy-breeze
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/kandybreeze?retryWrites=true&w=majority
SESSION_SECRET=kandy-breeze-super-secret-2025
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your-16-char-app-password
ADMIN_EMAIL=yourgmail@gmail.com
FRONTEND_URL=http://localhost:5173
```

**MongoDB Atlas Setup:**
1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string and replace `<username>`, `<password>` in your `.env`

**Gmail App Password Setup:**
1. Go to Google Account → Security
2. Enable 2-Factor Authentication
3. Go to "App passwords"
4. Generate a new app password for "Mail"
5. Copy the 16-character password to your `.env`

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` folder:

```env
VITE_API_URL=http://localhost:3000
```

## Running in Development

### Terminal 1 - Backend
```bash
cd backend
npm start
# or: npm run dev (with nodemon)
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

## URLs

- **Landing Page**: http://localhost:5173
- **Admin Login**: http://localhost:5173/login
- **Admin Dashboard**: http://localhost:5173/dashboard
- **API**: http://localhost:3000

## Admin Credentials

- **Username**: `MediaAsia`
- **Password**: `Mediaasia@55`

## Building for Production

```bash
cd frontend
npm run build
```

The backend is configured to serve the built frontend from the `dist` folder automatically.

## Key Features

### Booking System
- Bookings only open on Sundays (Sri Lanka time, UTC+5:30)
- Real-time countdown timer when bookings are closed
- Email notifications to admin and user on submission
- Status tracking: Pending → Approved/Not Approved

### Admin Dashboard
- Overview with key statistics
- Filter and search bookings
- Approve/Reject/Delete bookings
- Export bookings to CSV
- Email notifications on status changes

### Design
- Custom CSS variables for theming
- GSAP animations with ScrollTrigger
- Floating lanterns in hero section
- 3D card hover effects
- Custom cursor with glow effect
- Mobile-first responsive design

## API Endpoints

### Public
- `POST /api/bookings` - Submit a new booking

### Admin (Protected)
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/check-auth` - Check authentication status
- `GET /api/admin/bookings` - Get all bookings (with filters)
- `GET /api/admin/stats` - Get booking statistics
- `PATCH /api/admin/bookings/:id/status` - Update booking status
- `DELETE /api/admin/bookings/:id` - Delete a booking

## License

© 2025 Kandy Breeze. All rights reserved.
