"""
Scratch script used during development to verify Supabase Kong gateway accepts
the secret key format. No longer needed; kept as reference but credentials
must be loaded from environment, never hardcoded.

Usage (from backend/):
    SUPABASE_URL=https://xxx.supabase.co \
    SUPABASE_SECRET_KEY=sb_secret_... \
    python test_kong.py
"""
import os
import httpx

url = os.environ["SUPABASE_URL"].rstrip("/") + "/auth/v1/user"
key = os.environ["SUPABASE_SECRET_KEY"]

response = httpx.get(
    url,
    headers={
        "apikey": key,
        "Authorization": "Bearer fake.jwt.token",
    },
)
print("Status:", response.status_code)
print("Body:", response.text)
