FROM python:3.12-slim

WORKDIR /app

# Install system deps needed by asyncpg / psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install deps first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run server (migrations are handled separately)
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port 8000"]
