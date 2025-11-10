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
| `frontend` | React + Vite, served via Nginx | Customer-facing interface for browsing listings. |
| `backend`  | Node.js + Express      | REST API that exposes property listings and persists data in PostgreSQL. |
| `db`       | PostgreSQL 16          | Stores listings and seed data. |
| `keycloak` | Keycloak 24            | Identity and access management for securing protected endpoints. |

The frontend consumes the backend API via Axios and React Query. The backend connects to the PostgreSQL database using `pg` and can optionally enforce Keycloak authentication for protected routes.

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

4. Access the application at [http://localhost:3000](http://localhost:3000). The backend API is reachable at [http://localhost:4000](http://localhost:4000), PostgreSQL at port `5432`, and Keycloak at [http://localhost:8080/auth](http://localhost:8080/auth).

### Database schema

The database is automatically seeded on first start via `db/init.sql`, creating a `listings` table along with a few sample records for the UI to display.

### Keycloak configuration

Keycloak is started with default administrator credentials (`admin` / `admin`). Create a `hemnet` realm, add a confidential client named `hemnet-backend`, and configure public clients for the frontend as you expand authentication. Protected backend routes are guarded with Keycloak bearer tokens when `ENABLE_KEYCLOAK=true`.

