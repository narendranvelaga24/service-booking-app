# Unified Motor Vehicle Service Platform

This application integrates a comprehensive informational website about motor vehicle maintenance with a user-friendly service booking system. Users can learn about vehicle care, browse services, book appointments, and manage their accounts. Built with Node.js, Express, EJS, and SQLite.

## Features

1.  **Service Listing:**
    *   Displays available services with descriptions, prices, and estimated times.
    *   Allows users to select multiple services for booking.
2.  **Informational Content:**
    *   **Maintenance Tips Page:** Displays maintenance tips for vehicle owners with interactive collapsible sections.
    *   **About Us Page:** Information about the company, mission, values, and team member profiles.
    *   **Contact Page:** Basic contact information.
3.  **Booking System:**
    *   **Booking Page:** Calendar-like interface (basic date input) for choosing preferred date and time.
    *   Option for mobile service location details.
    *   Handles multiple services per booking.
4.  **User Authentication & Management:**
    *   Secure user registration and login (password hashing with bcryptjs).
    *   Session management using `express-session` and `connect-sqlite3`.
    *   Password recovery (mock email sending, logs token to console).
    *   User profile section for viewing and updating personal information.
    *   Booking history page for registered users.
    *   Secure logout.
5.  **Unified Navigation & UX:**
    *   Consistent header across all pages with dynamic links.
    *   Mobile-responsive design (basic).
    *   Flash messages for confirmations and errors.

## Technology Stack

*   **Backend:** Node.js, Express.js
*   **Frontend:** EJS (Embedded JavaScript templates), HTML5, CSS3, Vanilla JavaScript
*   **Database:** SQLite3 with persistent volume storage
*   **Authentication:** `bcryptjs` (password hashing), `express-session` (sessions), `connect-sqlite3` (session store)
*   **Environment Variables:** `dotenv`
*   **Deployment:** Railway.app with persistent volume storage
*   **Session Management:** SQLite-based session storage with Railway volume persistence

## Project Structure

```
service-booking-app/
├── database/                 # SQLite database files (main.db, sessions.db), schema.sql, data.sql
├── public/                   # Static assets (CSS, client-side JS, images)
├── src/
│   ├── config/database.js    # Database connection with Railway volume support
│   ├── controllers/          # Request handlers (auth, booking, service, user, view)
│   ├── middlewares/authMiddleware.js # Authentication middleware
│   ├── models/               # Data interaction logic (Booking, Service, User)
│   ├── routes/               # Route definitions
│   └── app.js                # Main Express application setup
├── views/                    # EJS templates
│   ├── auth/                 # Auth-related views (login, register, etc.)
│   ├── booking/              # Booking views (form, list, detail)
│   ├── layouts/main-layout.ejs # Main page layout
│   ├── partials/             # Reusable view components (header, footer)
│   ├── services/             # Service views (list, detail)
│   ├── user/profile.ejs      # User profile view
│   ├── 404.ejs, error.ejs, home.ejs, etc. # Other general views
├── .env                      # Environment variables (create from .env.example)
├── railway.toml              # Railway deployment configuration
├── package.json
└── README.md                 # This file
```

## Setup and Installation

### Local Development

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/narendranvelaga24/service-booking-app.git
    cd service-booking-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory:
    ```bash
    touch .env
    ```
    Add the following content to `.env`:
    ```
    SESSION_SECRET=your_generated_secret_key_here
    PORT=8080
    NODE_ENV=development
    ```
    Generate a secure session secret:
    ```bash
    node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
    ```

4.  **Run the application:**
    ```bash
    npm start
    ```
    The server will start on `http://localhost:8080`. The SQLite database and tables will be automatically created and populated with sample data on the first run.

### Railway Deployment

This application is configured for deployment on Railway.app with persistent volume storage.

1.  **Railway Configuration:**
    - The `railway.toml` file configures persistent volume storage
    - Database files are stored in `/app/data/database/` for persistence across deployments

2.  **Environment Variables on Railway:**
    Set the following in your Railway project:
    ```
    SESSION_SECRET=your_generated_secret_key_here
    NODE_ENV=production
    ```

3.  **Automatic Deployment:**
    - Connect your GitHub repository to Railway
    - Railway will automatically deploy when you push to the main branch
    - The volume will be created automatically for database persistence

4.  **Database Persistence:**
    - User data persists across deployments
    - Session data persists across container restarts
    - Booking history is maintained

## Key Features & Technical Highlights

### Database & Storage
*   **Persistent Volume Storage:** Database files stored in Railway's persistent volume (`/app/data/database/`)
*   **Automatic Schema Creation:** Database schema and sample data automatically initialized on first run
*   **Session Persistence:** User sessions persist across container restarts using SQLite session store
*   **Data Integrity:** Foreign key constraints and triggers ensure data consistency

### Authentication & Security
*   **Secure Password Hashing:** bcryptjs with salt rounds for password security
*   **Session Management:** Express-session with SQLite storage for persistent login sessions
*   **Protected Routes:** Middleware-based authentication for secure areas
*   **Flash Messages:** User feedback system for form submissions and errors

### Deployment & Infrastructure
*   **Railway.app Integration:** Configured for seamless deployment with `railway.toml`
*   **Environment Variable Support:** Flexible configuration for different environments
*   **Automatic Restarts:** Railway handles container restarts and health checks
*   **Volume Persistence:** Database and session data survive deployments and restarts

## Key Routes

### Public Routes
*   `/`: Homepage
*   `/services`: List all services
*   `/services/:id`: View service details
*   `/tips`: View maintenance tips
*   `/about`: View About Us page (with team members)
*   `/contact`: View Contact Us page

### Authentication Routes
*   `/auth/register`: User registration
*   `/auth/login`: User login
*   `/auth/logout`: User logout (POST request)
*   `/auth/forgot-password`: Forgot password form
*   `/auth/reset-password/:token`: Reset password form

### Protected Routes (Require Login)
*   `/bookings/new?selected_services=<id1>&selected_services=<id2>`: Booking form
*   `/bookings`: Create new booking (POST)
*   `/bookings/my-bookings`: View user's bookings
*   `/bookings/:id`: View specific booking details
*   `/user/profile`: View and update user profile

## Further Development Ideas

*   **Email Integration:** Implement actual email sending for verification and password resets using services like SendGrid or Nodemailer
*   **Admin Panel:** Add admin roles and an admin panel for managing users, services, and bookings
*   **Advanced Scheduling:** Develop a more sophisticated calendar/time slot selection UI with real-time availability
*   **Payment Integration:** Add payment processing with Stripe or PayPal
*   **Mobile App:** React Native or Flutter mobile application
*   **API Development:** RESTful API for mobile app and third-party integrations
*   **Testing Suite:** Comprehensive unit and integration tests with Jest/Mocha
*   **Performance Optimization:** Caching, database indexing, and query optimization
*   **Analytics Dashboard:** User behavior tracking and business analytics
*   **Multi-location Support:** Support for multiple service locations and technicians

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the package.json file for details.
