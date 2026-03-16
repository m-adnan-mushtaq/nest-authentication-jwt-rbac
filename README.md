# Nest Auth + Products Starter

Simple NestJS starter with JWT auth, role-based access (admin/user), and Products CRUD.

## Tech Stack

- **NestJS** – API framework  
- **PostgreSQL** – Database  
- **TypeORM** – ORM  
- **Redis** – Cache & BullMQ  
- **JWT** – Authentication  
- **Swagger** – API docs  
- **BullMQ** – Background jobs (e.g. email)  
- **MailHog** – Local SMTP (captures outgoing mail)

## Setup

1. **Clone and install**

```bash
git clone <repo-url>
cd nest-auth-assessment
npm install
```

2. **Environment**

```bash
cp .env.example .env
```

Edit `.env` and set at least `JWT_SECRET` and database password if needed.

3. **Start services (Postgres, Redis, MailHog)**

```bash
docker-compose up -d
```

- **MailHog UI**: http://localhost:8025 (view captured emails)

4. **Database**

Run migrations manually (you implement migrations). Then seed roles and admin user:

```bash
npm run seed
```

5. **Run the app**

```bash
# API server
npm run dev

# Worker (emails, etc.) – in another terminal
npm run worker
```

6. **Tests**

```bash
npm run test
```

## API docs

When the app is running: **http://localhost:3000/docs** (or the path set by `GLOBAL_PREFIX` and `SWAGGER_PATH` in `.env`).

## Roles

- **admin** – Users CRUD, Products CRUD, Audit logs read  
- **user** – Products read

Default admin (after seed): see `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` in `.env` (e.g. `admin@example.com` / `Admin@123`).

## License

UNLICENSED
