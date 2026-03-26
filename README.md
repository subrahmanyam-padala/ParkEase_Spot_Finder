# ParkEase - Smart Parking System

ParkEase is a full-stack parking management application with:
- User authentication (JWT)
- Parking spot discovery and booking
- Ticket generation and active ticket tracking
- Payment flow integration points
- Admin analytics and occupancy/pricing endpoints

## Tech Stack
- Frontend: React 18, React Router, Axios, Bootstrap
- Backend: Spring Boot 4, Spring Security, JPA/Hibernate
- Database: MySQL 8
- Build tools: Maven Wrapper, npm

## Project Structure
```text
.
|-- backend/
|   `-- ParkEase-backend/         # Spring Boot backend
|-- frontend/
|   `-- ParkEase-frontend/        # React frontend
`-- database/                     # SQL dumps/reference scripts
```

## Prerequisites
- Java 21 (required by backend)
- Node.js 18+ and npm
- MySQL 8+

## 1) Database Setup
Create the schema in MySQL:

```sql
CREATE DATABASE parking;
```

Backend config currently points to:
- schema: `parking`
- username: `root`
- password: `subbu123`

You can change these in:
`backend/ParkEase-backend/src/main/resources/application.properties`

Notes:
- `spring.jpa.hibernate.ddl-auto=update` is enabled, so Hibernate can create/update tables automatically.
- SQL files in `database/` are available as reference dumps.

## 2) Run Backend (Spring Boot)
From PowerShell:

```powershell
cd backend/ParkEase-backend
$env:JAVA_HOME='C:\Program Files\Eclipse Adoptium\jdk-21.0.10.7-hotspot'
$env:Path="$env:JAVA_HOME\bin;$env:Path"
.\mvnw.cmd -Dmaven.test.skip=true spring-boot:run
```

Backend runs on:
- `http://localhost:8080`

Quick API check:
- `GET http://localhost:8080/api/admin/occupancy/current`

## 3) Run Frontend (React)
From PowerShell:

```powershell
cd frontend/ParkEase-frontend
npm install
npm start
```

Frontend runs on:
- `http://localhost:3000`

Frontend API base URL defaults to:
- `http://localhost:8080`

Configured in:
- `frontend/ParkEase-frontend/src/services/apiClient.js`

## Main Frontend Routes
- `/` - Landing page
- `/login` - Login
- `/register` - Registration
- `/dashboard` - User dashboard
- `/book` - Book a parking spot
- `/ticket/:bookingId` - Ticket details
- `/active-ticket` - Active ticket & tracking
- `/admin/analytics` - Admin analytics dashboard

## Authentication Notes
- Backend uses JWT and role-based access (`ROLE_USER`, `ROLE_ADMIN`).
- Public auth endpoints:
  - `POST /api/auth/login`
  - `POST /api/auth/send-otp`
  - `POST /api/auth/register`

## Troubleshooting
1. Java version error (`UnsupportedClassVersionError`)
   - Ensure Java 21 is active in terminal.
2. DB connection/auth errors
   - Verify MySQL is running.
   - Confirm schema/username/password in `application.properties`.
3. Frontend cannot call backend
   - Ensure backend is running on `8080`.
   - Ensure frontend runs on `3000`.

## License
MIT (see `LICENSE`)
