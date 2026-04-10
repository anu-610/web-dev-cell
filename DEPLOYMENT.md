# Azure Deployment Guide

This document explains how to deploy the **Web Dev Cell** application securely on Microsoft Azure.

## Prerequisites
- An active Azure Cloud subscription.
- Azure CLI installed locally (`az`).
- Docker locally.

## Architecture Overview
We will deploy the containerized application using **Azure Web App for Containers (App Service)** and an **Azure Database for PostgreSQL (Flexible Server)**. Supabase remains a separate, external SaaS component exclusively for Auth.

### 1. Database Setup (Azure Database for PostgreSQL)
Instead of running our own DB container in production, managed PostgreSQL is heavily recommended.

1. **Create the server**:
   Navigate to Azure Portal -> PostgreSQL Flexible Server -> Create.
   - Pick the `Burstable B1ms` tier (cheapest).
   - Define a strong Admin Username and Password.
2. **Networking**: 
   - Ensure "Allow public access from any Azure service within Azure to this server" is checked.
3. **Get the Connection String**:
   When provisioned, your connection string will look like: 
   `postgres://<admin_user>:<password>@<your-server-name>.postgres.database.azure.com:5432/postgres?sslmode=require`

### 2. Frontend Configuration & Build
The frontend uses Vite, which produces static files. We will let Nginx serve them inside a lightweight Docker container.

1. Change `VITE_API_URL` to point to the production backend's URL.
   Create a `frontend/.env.production` file:
   ```env
   VITE_API_URL=https://webdevcell-api.azurewebsites.net/api/v1
   VITE_SUPABASE_URL=https://<xyz>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon-key>
   ```

### 3. Container Registry (Azure Container Registry)
1. **Create ACR**:
   ```bash
   az acr create --resource-group DevCell_RG --name webdevcellregistry --sku Basic
   ```
2. **Login and Push**:
   ```bash
   az acr login --name webdevcellregistry
   
   # Build Frontend
   docker build -t webdevcellregistry.azurecr.io/frontend:latest --target prod ./frontend
   docker push webdevcellregistry.azurecr.io/frontend:latest

   # Build Backend
   docker build -t webdevcellregistry.azurecr.io/backend:latest ./backend
   docker push webdevcellregistry.azurecr.io/backend:latest
   ```

### 4. Deploying App Services
We will create **two** App Services (one for Python FastAPI, one for the Nginx Frontend). 

#### A. Backend Setup
1. **Create the Python App**: Go to App Services -> Create -> "Docker Container" -> Linux.
2. **Point to Image**: `webdevcellregistry.azurecr.io/backend:latest`
3. **Environment Variables**: Add these in Configuration:
   - `POSTGRES_USER`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_HOST=your-azure-pg.postgres.database.azure.com`
   - `POSTGRES_DB=webdevcell`
   - `SUPABASE_URL`
   - `SUPABASE_SECRET_KEY`

> ❗️ **Note on migrations**: The backend `CMD` automatically runs Alembic migrations on startup before booting `uvicorn`.

#### B. Frontend Setup
1. **Create the Frontend App**: App Services -> Create -> Docker Container.
2. **Point to Image**: `webdevcellregistry.azurecr.io/frontend:latest`
3. **Exposed Ports**: Go to Configuration and set `WEBSITES_PORT=80` so Azure knows the container listens on 80.

### 5. Finalizing
1. Launch the Frontend App Service URL (e.g., `https://webdevcell-frontend.azurewebsites.net`). 
2. Test the Admin CMS Login to verify JWT verification logic routes securely to the managed Backend.
3. Once judges review, consider mapping a custom domain (e.g., `webdevcell.iitmandi.co.in`) via Azure App Service Domain settings!
