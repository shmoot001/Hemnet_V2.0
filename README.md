# Hemnet V2.0

## Overview
Hemnet is an MVP digital marketplace that connects home buyers, sellers, and real estate agents to simplify property discovery and listing management across Sweden.

## Purpose
Provide a centralized hub where buyers can browse listings and where sellers or agents can showcase properties in an intuitive, transparent experience.

## Core Users
- **Home buyers** searching for properties.
- **Sellers and real estate agents** listing homes on the platform.

## Problem Statement
Property seekers often need to visit multiple fragmented sources to gather information about homes for sale. Comparing listings and keeping track of interesting properties is time-consuming and inefficient for both buyers and sellers.

## MVP Solution
The Hemnet MVP focuses on delivering a streamlined property marketplace with the following capabilities:

1. **Browse and search** for homes currently for sale.
2. **Filter listings** by price range, location, property type, and size.
3. **View detailed property pages** with high-quality images, descriptions, and direct contact information.
4. **Save favorite listings** for quick access later.

## Value Proposition
By aggregating listings from multiple agencies into a single platform, Hemnet offers buyers and sellers transparency, efficiency, and convenience during the property search and listing process.

## Future Enhancements
Beyond the MVP, Hemnet can grow into a richer ecosystem with features such as:

- Personalized recommendations tailored to user preferences.
- Real-time market analytics and price predictions.
- Interactive maps and neighborhood insights.
- In-app chat or messaging between buyers and agents.

## Architecture Overview

The Hemnet MVP now ships with a modern web stack that can be orchestrated locally with Docker Compose:

| Service    | Technology            | Purpose |
|------------|-----------------------|---------|
| `nginx`    | Nginx 1.27            | Edge reverse proxy that serves the SPA and forwards `/api` calls to the backend. |
| `frontend` | React + Vite, served via internal Nginx | Customer-facing interface for browsing listings. |
| `backend`  | Node.js + Express      | REST API that exposes property listings and persists data in PostgreSQL. |
| `db`       | PostgreSQL 16          | Stores listings and seed data. |
| `keycloak` | Keycloak 24            | Identity and access management for securing protected endpoints. |

The edge Nginx container (see [`nginx/default.conf`](nginx/default.conf)) exposes the SPA on port 3000 and rewrites `/api/*` requests to the backend, which keeps browser traffic on a single origin. The frontend consumes the backend API via Axios and React Query. The backend connects to the PostgreSQL database using `pg` and can optionally enforce Keycloak authentication for protected routes.

### Running the stack with Docker

1. Ensure Docker and Docker Compose are installed on your machine.
2. Duplicate the provided environment examples if you need to override defaults:

   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. Build and start the services:

   ```bash
   docker compose up --build
   ```

4. Access the application at [http://localhost:3000](http://localhost:3000). All browser calls to `/api` are routed through the gateway Nginx container to the backend, which also remains reachable directly at [http://localhost:4000](http://localhost:4000) for debugging. PostgreSQL listens on port `5432`, and Keycloak is available at [http://localhost:8080/auth](http://localhost:8080/auth).

   > **Tip:** When running the frontend locally without Docker, set `VITE_API_URL` to `http://localhost:4000` (or configure a Vite proxy) so the SPA can reach the Express server directly.

### Database schema

The database is automatically seeded on first start via `db/init.sql`, creating a `listings` table along with a few sample records for the UI to display.

### Keycloak configuration

The Docker Compose stack starts Keycloak in developer mode with the administrator account `admin` / `admin` and exposes the console at [http://localhost:8080/auth](http://localhost:8080/auth). The backend reads its Keycloak integration settings from the following environment variables (see `backend/.env.example` or the `backend` service definition in `docker-compose.yml`):

| Variable | Purpose | Default |
| --- | --- | --- |
| `ENABLE_KEYCLOAK` | Toggles Keycloak protection on write endpoints. | `true` |
| `KEYCLOAK_SERVER_URL` | Base URL of the Keycloak server (must include the `/auth` relative path used in Compose). | `http://keycloak:8080/auth` |
| `KEYCLOAK_REALM` | Realm that issues tokens accepted by the backend. | `hemnet` |
| `KEYCLOAK_CLIENT_ID` | Bearer-only client that represents the backend API. | `hemnet-backend` |
| `KEYCLOAK_SSL_REQUIRED` | SSL requirement setting forwarded to the Keycloak adapter. | `none` |

To provision a fresh realm after the containers start:

1. Sign in to the Keycloak admin console using `admin` / `admin`.
2. Create a realm named **hemnet** (or adjust `KEYCLOAK_REALM` to match your own name).
3. Within the realm, create a client called **hemnet-backend** with the following options:
   - **Client type**: OpenID Connect.
   - **Access type**: Bearer-only (disables browser login for this client).
   - Save the client and keep the generated internal ID to match `KEYCLOAK_CLIENT_ID` (default `hemnet-backend`).
4. Create a public client for the React app (for example **hemnet-frontend**) with:
   - **Access type**: Public.
   - **Valid redirect URIs**: `http://localhost:3000/*`.
   - **Web origins**: `http://localhost:3000`.
5. Add realm roles (for example `listings:write`) if you plan to restrict access further, and assign them to a test user.
6. Create at least one user, set a password, and optionally mark it as temporary to force a reset on first login.

You can now obtain tokens for protected backend routes by authenticating the user through the frontend client (PKCE flow) or by using the Direct Access Grants flow against the `hemnet-frontend` client during development. Include the returned bearer token in the `Authorization` header (`Authorization: Bearer <token>`) when calling routes such as `POST /listings`.

