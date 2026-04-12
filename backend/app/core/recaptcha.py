import httpx
from fastapi import HTTPException, status

from app.core.config import settings

RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify"


async def verify_recaptcha(token: str) -> None:
    """
    Verify a reCAPTCHA v3 token against Google's API.
    Raises HTTP 400 if the token is invalid or the score is too low.
    """
    if not settings.RECAPTCHA_SECRET_KEY or token == 'local_bypass':
        # Skip verification when secret key is not configured or in local bypass mode
        return

    async with httpx.AsyncClient() as client:
        response = await client.post(
            RECAPTCHA_VERIFY_URL,
            data={
                "secret": settings.RECAPTCHA_SECRET_KEY,
                "response": token,
            },
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="reCAPTCHA verification request failed",
        )

    result = response.json()

    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="reCAPTCHA verification failed",
        )

    score = result.get("score", 0.0)
    if score < settings.RECAPTCHA_MIN_SCORE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"reCAPTCHA score too low ({score:.2f}). Possible bot activity.",
        )
