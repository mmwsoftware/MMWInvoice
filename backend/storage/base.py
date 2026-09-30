"""Abstract storage interface. Implementations can be local filesystem or S3."""
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Optional


class StorageBackend(ABC):
    """Abstract base for document storage."""
    
    @abstractmethod
    def save_pdf(self, pdf_bytes: bytes, relative_path: str) -> str:
        """Save PDF bytes. Returns the relative path where it was stored."""
        ...
    
    @abstractmethod
    def get_pdf(self, relative_path: str) -> bytes:
        """Retrieve PDF bytes by relative path."""
        ...
    
    @abstractmethod
    def get_pdf_path(self, relative_path: str) -> Path:
        """Get the absolute filesystem path (for local backend)."""
        ...
    
    @abstractmethod
    def exists(self, relative_path: str) -> bool:
        """Check if a file exists."""
        ...
    
    @abstractmethod
    def delete(self, relative_path: str) -> bool:
        """Delete a file. Returns True if deleted."""
        ...
