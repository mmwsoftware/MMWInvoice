"""Configuration adapter for the invoice engine.

The original POC engine accesses config.TEMPLATE_PDF, config.FIELD_MAP, etc.
as module-level attributes. This adapter exposes them in the same way,
resolving paths from the backend's settings.
"""
from pathlib import Path
from functools import lru_cache


@lru_cache()
def _settings():
    from config import get_settings
    return get_settings()


# Module-level attributes matching what the engine expects
TEMPLATE_PDF = property(lambda self: Path(_settings().TEMPLATE_DIR) / 'original_invoice.pdf')
FIELD_MAP = property(lambda self: Path(__file__).parent / 'invoice_field_map.json')
FONT_DIR = property(lambda self: Path(_settings().FONT_DIR))
SELLER_STATE_CODE = property(lambda self: _settings().SELLER_STATE_CODE)
DEFAULT_GST_RATE = property(lambda self: float(_settings().DEFAULT_GST_RATE))
PUBLIC_INVOICE_URL = property(lambda self: _settings().PUBLIC_BASE_URL)


# Since we can't use property at module level, use a lazy module pattern
class _Config:
    @property
    def TEMPLATE_PDF(self):
        return Path(_settings().TEMPLATE_DIR) / 'original_invoice.pdf'

    @property
    def FIELD_MAP(self):
        return Path(__file__).parent / 'invoice_field_map.json'

    @property
    def FONT_DIR(self):
        return Path(_settings().FONT_DIR)

    @property
    def SELLER_STATE_CODE(self):
        return _settings().SELLER_STATE_CODE

    @property
    def DEFAULT_GST_RATE(self):
        return float(_settings().DEFAULT_GST_RATE)

    @property
    def PUBLIC_INVOICE_URL(self):
        return _settings().PUBLIC_BASE_URL


import sys
sys.modules[__name__] = _Config()
