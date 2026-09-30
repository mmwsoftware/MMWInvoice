"""
ME-QR Python SDK
================

Official Python SDK for the ME-QR API.
Generate, customize and manage QR codes programmatically.

Docs:    https://me-qr.com/api/doc
API Key: https://me-qr.com/account

QR type IDs:
    QRType.LINK      = 1   — URL / website
    QRType.PDF       = 4   — PDF document
    QRType.EMAIL     = 5   — Email
    QRType.VCARD     = 7   — Contact card
    QRType.APP_STORE = 8   — App Store / Google Play
    QRType.WHATSAPP  = 9   — WhatsApp
    QRType.AUDIO     = 10  — Audio file
    QRType.MAP       = 11  — GPS location
    QRType.TEXT      = 15  — Plain text
    QRType.IMAGE     = 16  — Image gallery
    QRType.WIFI      = 17  — Wi-Fi credentials
    QRType.PHONE     = 27  — Phone call
    QRType.SMS       = 28  — SMS
    QRType.VIDEO     = 29  — Video

Example::

    from me_qr import MEQRClient

    client = MEQRClient(token="YOUR_API_TOKEN")

    qr = client.create_link("https://example.com", format="svg")
    qr.save("qr.svg")
"""

from __future__ import annotations

import base64
from dataclasses import dataclass
from enum import IntEnum
from typing import Any, Dict, List, Literal, Optional

try:
    import httpx
    _HTTP_CLIENT = "httpx"
except ImportError:
    import urllib.request as _urllib
    import urllib.error as _urllib_error
    _HTTP_CLIENT = "urllib"


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class QRType(IntEnum):
    """QR code type IDs accepted by the ME-QR API."""
    LINK      = 1
    PDF       = 4
    EMAIL     = 5
    VCARD     = 7
    APP_STORE = 8
    WHATSAPP  = 9
    AUDIO     = 10
    MAP       = 11
    TEXT      = 15
    IMAGE     = 16
    WIFI      = 17
    PHONE     = 27
    SMS       = 28
    VIDEO     = 29


class QRFormat(str):
    PNG  = "png"
    JPEG = "jpeg"
    SVG  = "svg"
    JSON = "json"


# Wi-Fi encryption values accepted by the API
WIFI_ENC_WPA  = "wpa/wpa2"
WIFI_ENC_WPA3 = "wpa3"
WIFI_ENC_WEP  = "wep"
WIFI_ENC_NONE = "none"
WIFI_ENC_RAW  = "raw"


# ---------------------------------------------------------------------------
# Data classes
# ---------------------------------------------------------------------------

@dataclass
class QROptions:
    """Visual appearance options for the QR code."""
    size: int = 300
    background_color: str = "#FFFFFF"
    foreground_color: str = "#000000"
    error_correction: Literal["L", "M", "Q", "H"] = "M"
    eye_frame_shape: Optional[str] = None
    eye_ball_shape: Optional[str] = None
    body_shape: Optional[str] = None
    logo_url: Optional[str] = None
    logo_size: Optional[int] = None

    def to_api_dict(self) -> Dict[str, Any]:
        d: Dict[str, Any] = {
            "size": self.size,
            "backgroundColor": self.background_color,
            "foregroundColor": self.foreground_color,
            "errorCorrection": self.error_correction,
        }
        if self.eye_frame_shape: d["eyeFrameShape"] = self.eye_frame_shape
        if self.eye_ball_shape:  d["eyeBallShape"]  = self.eye_ball_shape
        if self.body_shape:      d["bodyShape"]      = self.body_shape
        if self.logo_url:        d["logoUrl"]        = self.logo_url
        if self.logo_size is not None: d["logoSize"] = self.logo_size
        return d


@dataclass
class QRCodeResult:
    """Result from a QR code generation request."""
    content: bytes
    format: str

    def save(self, path: str) -> None:
        """Save the QR code to a file."""
        with open(path, "wb") as f:
            f.write(self.content)

    def to_base64(self) -> str:
        """Return base64-encoded string."""
        return base64.b64encode(self.content).decode("utf-8")

    def to_data_url(self) -> str:
        """Return a data URL for embedding in HTML/CSS."""
        mime_map = {"png": "image/png", "jpeg": "image/jpeg", "svg": "image/svg+xml"}
        mime = mime_map.get(self.format, "application/octet-stream")
        return f"data:{mime};base64,{self.to_base64()}"


# ---------------------------------------------------------------------------
# Error
# ---------------------------------------------------------------------------

class MEQRError(Exception):
    """Raised when the ME-QR API returns an error."""
    def __init__(self, message: str, status_code: Optional[int] = None, response: Any = None):
        super().__init__(message)
        self.status_code = status_code
        self.response = response


# ---------------------------------------------------------------------------
# Client
# ---------------------------------------------------------------------------

class MEQRClient:
    """
    ME-QR API Client.

    :param token:    Your API token from https://me-qr.com/account
    :param base_url: Override the API base URL (optional)
    :param timeout:  Request timeout in seconds (default: 10)

    Example::

        client = MEQRClient(token="YOUR_TOKEN")

        result = client.create_link("https://me-qr.com")
        result.save("qr.png")

        wifi = client.create_wifi("MyNetwork", "password123")
        wifi.save("wifi.png")
    """

    BASE_URL = "https://me-qr.com/api"

    def __init__(
        self,
        token: str,
        base_url: Optional[str] = None,
        timeout: float = 10.0,
    ) -> None:
        if not token:
            raise MEQRError("API token is required. Get yours at https://me-qr.com/account")
        self.token = token
        self.base_url = (base_url or self.BASE_URL).rstrip("/")
        self.timeout = timeout

    def create(
        self,
        qr_type: QRType | int,
        title: str,
        qr_fields_data: Dict[str, Any],
        format: str = QRFormat.PNG,
        options: Optional[QROptions] = None,
    ) -> QRCodeResult:
        """
        Generate a QR code via the ME-QR API.

        :param qr_type:        QR type ID — use QRType enum (e.g. QRType.LINK)
        :param title:          Name shown in your ME-QR dashboard
        :param qr_fields_data: Content fields dict (depend on qr_type)
        :param format:         Output format: png | jpeg | svg | json
        :param options:        Visual appearance options (QROptions instance)
        :returns:              QRCodeResult with .content bytes and helper methods
        """
        payload = {
            "token":        self.token,
            "qrType":       int(qr_type),
            "title":        title,
            "service":      "api",
            "format":       format,
            "qrOptions":    (options or QROptions()).to_api_dict(),
            "qrFieldsData": qr_fields_data,
        }

        raw = self._post(f"{self.base_url}/qr/create/", payload)
        return QRCodeResult(content=raw, format=format)

    def create_link(
        self,
        url: str,
        title: Optional[str] = None,
        format: str = QRFormat.PNG,
        options: Optional[QROptions] = None,
    ) -> QRCodeResult:
        """Shortcut: URL / Link QR code. qrFieldsData key: 'link'"""
        return self.create(QRType.LINK, title or f"QR for {url}", {"link": url}, format, options)

    def create_wifi(
        self,
        ssid: str,
        password: str = "",
        encryption: str = WIFI_ENC_WPA,
        title: Optional[str] = None,
        format: str = QRFormat.PNG,
        options: Optional[QROptions] = None,
    ) -> QRCodeResult:
        """
        Shortcut: Wi-Fi QR code.

        :param encryption: One of 'wpa/wpa2', 'wpa3', 'wep', 'none', 'raw'
        """
        return self.create(
            QRType.WIFI,
            title or f"Wi-Fi: {ssid}",
            {"ssid": ssid, "password": password, "encryption": encryption},
            format,
            options,
        )

    def create_vcard(
        self,
        name: str,
        last_name: Optional[str] = None,
        phones: Optional[List[Dict[str, Any]]] = None,
        emails: Optional[List[Dict[str, Any]]] = None,
        organization: Optional[str] = None,
        title: Optional[str] = None,
        format: str = QRFormat.PNG,
        options: Optional[QROptions] = None,
    ) -> QRCodeResult:
        """
        Shortcut: vCard QR code.

        :param name:         First name (required)
        :param last_name:    Last name
        :param phones:       [{"phone": "+1234567890", "type": 0}, ...]  type: 0=general, 1=work
        :param emails:       [{"email": "a@b.com",     "type": 0}, ...]  type: 0=general, 1=corporate
        :param organization: Company name
        """
        data: Dict[str, Any] = {"name": name}
        if last_name:     data["lastName"]     = last_name
        if organization:  data["organization"] = organization
        if phones:        data["phones"]       = phones
        if emails:        data["emails"]       = emails

        full_name = f"{name} {last_name}".strip() if last_name else name
        return self.create(QRType.VCARD, title or f"vCard: {full_name}", data, format, options)

    def create_email(
        self,
        email: str,
        subject: Optional[str] = None,
        body: Optional[str] = None,
        title: Optional[str] = None,
        format: str = QRFormat.PNG,
        options: Optional[QROptions] = None,
    ) -> QRCodeResult:
        """Shortcut: Email QR code. qrFieldsData keys: 'emailTo', 'subject', 'body'"""
        data: Dict[str, Any] = {"emailTo": email}
        if subject: data["subject"] = subject
        if body:    data["body"]    = body

        return self.create(QRType.EMAIL, title or f"Email: {email}", data, format, options)

    def create_text(
        self,
        text: str,
        title: Optional[str] = None,
        format: str = QRFormat.PNG,
        options: Optional[QROptions] = None,
    ) -> QRCodeResult:
        """Shortcut: plain Text QR code. qrFieldsData key: 'text'"""
        return self.create(QRType.TEXT, title or "Text QR", {"text": text}, format, options)

    # ------------------------------------------------------------------
    # Internal
    # ------------------------------------------------------------------

    def _post(self, url: str, payload: Dict[str, Any]) -> bytes:
        import json
        data = json.dumps(payload).encode("utf-8")
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "me-qr-python-sdk/1.0",
        }

        if _HTTP_CLIENT == "httpx":
            with httpx.Client(timeout=self.timeout) as client:
                resp = client.post(url, content=data, headers=headers)
                if resp.status_code != 200:
                    raise MEQRError(
                        f"ME-QR API error: {resp.status_code}",
                        status_code=resp.status_code,
                        response=resp.text,
                    )
                return resp.content
        else:
            req = _urllib.Request(url, data=data, headers=headers, method="POST")
            try:
                with _urllib.urlopen(req, timeout=self.timeout) as resp:
                    return resp.read()
            except _urllib_error.HTTPError as exc:
                body = exc.read().decode("utf-8", errors="replace")
                raise MEQRError(
                    f"ME-QR API error: {exc.code}", status_code=exc.code, response=body
                ) from exc
            except Exception as exc:
                raise MEQRError(f"Request failed: {exc}") from exc
