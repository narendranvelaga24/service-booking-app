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
*   **Database:** SQLite3
*   **Authentication:** `bcryptjs` (password hashing), `express-session` (sessions), `connect-sqlite3` (session store)
*   **Environment Variables:** `dotenv`

## Project Structure

```
service-booking-app/
├── database/                 # SQLite database file (main.db), schema.sql, data.sql, sessions.db
├── public/                   # Static assets (CSS, client-side JS, images)
├── src/
│   ├── config/database.js    # Database connection and initialization
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
├── .env.example              # Example environment variables file
├── package.json
└── README.md                 # This file
```

## Setup and Installation

1.  **Clone the repository (if applicable) or ensure all files are in the `service-booking-app` directory.**

2.  **Install dependencies:**
    Navigate to the `service-booking-app` directory in your terminal and run:
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Copy `.env.example` to a new file named `.env`:
    ```bash
    cp .env.example .env
    ```
    Open `.env` and **change `SESSION_SECRET`** to a long, random string. You can generate one using:
    ```bash
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    ```
    Adjust `PORT` or other variables if needed.

4.  **Run the application:**
    ```bash
    node src/app.js
    ```
    The server will start, typically on `http://localhost:3001` (or the port specified in `.env`). The console will output the exact URL. The SQLite database (`main.db` and `sessions.db`) and its tables will be automatically created and populated with sample data on the first run.

5.  **Access the application:**
    Open your web browser and navigate to `http://localhost:3001`.

## Key Routes

*   `/`: Homepage
*   `/auth/register`: User registration
*   `/auth/login`: User login
*   `/auth/logout`: User logout (POST request)
*   `/auth/forgot-password`: Forgot password form
*   `/auth/reset-password/:token`: Reset password form
*   `/services`: List all services
*   `/services/:id`: View service details
*   `/tips`: View maintenance tips
*   `/about`: View About Us page (with team members)
*   `/contact`: View Contact Us page
*   `/bookings/new?selected_services=<id1>&selected_services=<id2>`: Booking form (requires login)
*   `/bookings`: Create new booking (POST, requires login)
*   `/bookings/my-bookings`: View user's bookings (requires login)
*   `/bookings/:id`: View specific booking details (requires login and ownership)
*   `/user/profile`: View and update user profile (requires login)

## Further Development Ideas

*   Implement actual email sending for verification and password resets.
*   Add admin roles and an admin panel for managing users, services, and bookings.
*   Develop a more sophisticated calendar/time slot selection UI.
*   Implement real-time availability checks for booking slots.
*   Add payment integration.
*   Enhance client-side validation and interactivity.
*   Write comprehensive tests.
