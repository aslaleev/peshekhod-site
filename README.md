# Peshekhod Website

Minimal website for the Peshekhod supermarket chain.

## Structure

- `frontend` - Vue 3 + Vite static site, ready for Vercel.
- `backend` - Java 17 + Spring Boot API with public company data.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

For Vercel, set the project root to `frontend`, build command to `npm run build`, and output directory to `dist`.

## Backend

```bash
cd backend
mvn spring-boot:run
```

The backend exposes:

- `GET /api/company`
- `GET /api/stores`
- `GET /api/vacancies`

