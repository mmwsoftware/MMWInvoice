"""Configuration adapter for the quotation engine.

The original POC engine accesses config.TEMPLATE_PDF, config.FIELD_MAP, etc.
as module-level attributes. This adapter exposes them lazily via sys.modules
replacement, resolving paths from the backend's settings.
"""
from pathlib import Path
from functools import lru_cache


@lru_cache()
def _settings():
    from config import get_settings
    return get_settings()


class _Config:
    @property
    def TEMPLATE_PDF(self):
        return Path(_settings().TEMPLATE_DIR) / 'quotation_template.pdf'

    @property
    def FIELD_MAP(self):
        return Path(__file__).parent / 'quote_field_map.json'

    @property
    def FONT_DIR(self):
        return Path(_settings().FONT_DIR)

    @property
    def STORAGE_DIR(self):
        return Path(_settings().STORAGE_DIR)


import sys
sys.modules[__name__] = _Config()
