# ParkEase Frontend

ParkEase is a React frontend for the City Mall smart parking system. It includes user flows for booking, payment, tickets, and profile management, plus a separate admin dashboard for operations.

## Frontend and Backend

Frontend (this repository):
- React SPA that handles user and admin experiences
- Talks to backend APIs via Axios clients in src/utils

Backend:
- Exposes REST APIs consumed by the frontend
- Base URLs and endpoints are configured in src/utils (update there to point at your backend)

## Features

- Public landing, login, registration, and password recovery
- User dashboard, booking, checkout, payment, and ticket viewing
- Active ticket tracking and complaints
- Admin authentication and admin dashboard pages (slots, bookings, revenue, users, reports, complaints, scanner)
- Responsive UI with Bootstrap and animations

## Tech Stack

- React 18
- React Router
- Bootstrap + Bootstrap Icons
- Axios
- Framer Motion

## Project Structure

- public/          Static HTML
- src/             Application source
  - components/    Shared UI components
  - context/       App context provider
  - pages/         Route pages (user and admin)
  - utils/         API clients and helpers
  - images/        App images

## Getting Started

### Prerequisites

- Node.js 18+ (recommended)
- npm 9+

### Install

npm install

### Run (development)

npm start

### Build (production)

npm run build

### Test

npm test

## Routes Overview

Public:
- /
- /login
- /register
- /forgot-password

User (protected):
- /dashboard
- /book
- /checkout
- /payment/:bookingId
- /ticket/:bookingId
- /active-ticket
- /chatbot
- /my-bookings
- /profile
- /complaints

Admin:
- /admin/login
- /admin/register
- /admin/forgot-password
- /admin (layout)
  - /admin/dashboard
  - /admin/scanner
  - /admin/slots
  - /admin/bookings
  - /admin/revenue
  - /admin/users
  - /admin/admin-users
  - /admin/reports
  - /admin/complaints

## Notes

- Admin pages are protected and use a dedicated layout.
- API configuration lives in src/utils.

## License

MIT
