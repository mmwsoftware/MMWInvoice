"""QR code service for invoice public links.

The QR must encode the MMW public URL directly. Third-party redirect URLs are
rejected by verification.
"""
from __future__ import annotations

import io
import secrets

from config import get_settings


class QRError(Exception):
    pass


def generate_public_token() -> str:
    return secrets.token_urlsafe(24)  # 192 bits of entropy


def build_public_url(token: str) -> str:
    settings = get_settings()
    return f"{settings.PUBLIC_BASE_URL.rstrip('/')}/v/{token}"


def _decode_qr(image_bytes: bytes) -> str:
    import numpy as np
    import cv2

    arr = np.frombuffer(image_bytes, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_GRAYSCALE)
    if img is None:
        return ""
    img = cv2.copyMakeBorder(img, 40, 40, 40, 40, cv2.BORDER_CONSTANT, value=255)
    text, _, _ = cv2.QRCodeDetector().detectAndDecode(img)
    return text or ""


def _verify_qr(image_bytes: bytes, expected_url: str) -> None:
    try:
        got = _decode_qr(image_bytes)
    except ImportError as exc:
        raise QRError("QR verification requires numpy and OpenCV") from exc
    if got != expected_url:
        raise QRError(
            "QR does not encode the MMW public URL directly. "
            f"Expected {expected_url!r}, decoded {got!r}."
        )


def _local_qr(url: str) -> tuple[bytes, str]:
    import qrcode

    qr = qrcode.QRCode(
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=12,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    buf = io.BytesIO()
    qr.make_image(fill_color="black", back_color="white").save(buf, "PNG")
    return buf.getvalue(), "png"


def _meqr(url: str) -> tuple[bytes, str]:
    settings = get_settings()
    if not settings.ME_QR_API_TOKEN:
        raise QRError("QR_PROVIDER=meqr but ME_QR_API_TOKEN is not configured")
    try:
        from engines.invoice.me_qr_sdk import MEQRClient, QROptions, MEQRError
        client = MEQRClient(token=settings.ME_QR_API_TOKEN, timeout=20.0)
        result = client.create_link(
            url,
            title="MMW Invoice",
            format="png",
            options=QROptions(size=1000, error_correction="M"),
        )
        return result.content, "png"
    except Exception as exc:
        raise QRError(f"ME-QR request failed: {exc}") from exc


def create_qr_image(url: str) -> tuple[bytes, str]:
    """Create and verify a QR according to QR_PROVIDER."""
    settings = get_settings()
    if settings.QR_PROVIDER == "local_test":
        image_bytes, ext = _local_qr(url)
    elif settings.QR_PROVIDER == "meqr":
        image_bytes, ext = _meqr(url)
    else:
        raise QRError(f"Unknown QR_PROVIDER {settings.QR_PROVIDER!r}")

    _verify_qr(image_bytes, url)
    return image_bytes, ext


def create_preview_qr(url: str) -> tuple[bytes, str]:
    """QR for preview PDFs only: always local, never calls a paid QR provider."""
    return _local_qr(url)
