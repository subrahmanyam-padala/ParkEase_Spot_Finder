# ParkEase Azure Deployment Guide

This guide deploys:
- Backend: Azure Web App (Java 21)
- Frontend: Azure Static Web Apps

## 1. Prerequisites

- Azure subscription
- GitHub repository connected to this codebase
- MySQL database reachable from Azure (Azure Database for MySQL preferred)

## 2. Backend (Azure Web App)

Create Azure Web App:
- Runtime: Java 21 (Linux)
- App name example: `parkease-backend`

Download publish profile and add GitHub secret:
- `AZURE_BACKEND_PUBLISH_PROFILE`
- `AZURE_BACKEND_APP_NAME` (example: `parkease-backend`)

Set Azure Web App Application Settings:
- `SPRING_DATASOURCE_URL=jdbc:mysql://<host>:3306/infosys_parkease?useSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true`
- `SPRING_DATASOURCE_USERNAME=<db_user>`
- `SPRING_DATASOURCE_PASSWORD=<db_password>`
- `JWT_SECRET=<strong-random-secret-min-32-chars>`
- `JWT_EXPIRATION=86400000`
- `RAZORPAY_KEY_ID=<razorpay_key_id>`
- `RAZORPAY_KEY_SECRET=<razorpay_key_secret>`
- `SPRING_MAIL_USERNAME=<smtp_user>`
- `SPRING_MAIL_PASSWORD=<smtp_app_password>`
- `GOOGLE_DRIVE_CREDENTIALS_FILE=credentials.json`
- `GOOGLE_DRIVE_TOKENS_DIR=tokens`
- `GOOGLE_DRIVE_FOLDER_ID=<drive_folder_id>`
- `APP_CORS_ALLOWED_ORIGIN_PATTERNS=http://localhost:*,https://localhost:*,https://<frontend-static-site>.azurestaticapps.net`

Optional logging settings:
- `LOG_LEVEL_WEB=INFO`
- `LOG_LEVEL_MAIL=INFO`

## 3. Frontend (Azure Static Web Apps)

Create Azure Static Web App and connect GitHub repo.

Add GitHub secrets:
- `AZURE_STATIC_WEB_APPS_API_TOKEN`
- `REACT_APP_API_BASE_URL=https://<backend-app-name>.azurewebsites.net/api`

Notes:
- `staticwebapp.config.json` is included for SPA route fallback.
- Frontend API base now supports `REACT_APP_API_BASE_URL`.

## 4. GitHub Workflows Added

- `.github/workflows/deploy-backend-azure.yml`
- `.github/workflows/deploy-frontend-azure-staticwebapp.yml`

## 5. Deployment Order

1. Deploy backend workflow first.
2. Verify backend health endpoint or sample API route.
3. Set frontend `REACT_APP_API_BASE_URL` secret to backend URL.
4. Deploy frontend workflow.
5. Validate login, booking, payment, scanner, admin report flows.

## 6. Critical Checks After Deployment

- CORS: no browser CORS errors when frontend calls backend.
- Auth: JWT login works and protected routes load.
- DB connectivity: backend starts and reads/writes data.
- Payment verification: Razorpay callback/verify flow works.
- Admin pages: bookings/refunds/reports load successfully.

## 7. Troubleshooting

- 401 loops on frontend:
  - Check JWT secret and token issuance.
- CORS blocked:
  - Ensure frontend domain is included in `APP_CORS_ALLOWED_ORIGIN_PATTERNS`.
- Backend 500 on startup:
  - Check datasource settings and DB firewall rules.
- Frontend calls localhost in production:
  - Ensure `REACT_APP_API_BASE_URL` GitHub secret is set.
