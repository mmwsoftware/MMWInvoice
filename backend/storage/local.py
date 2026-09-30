"""Local filesystem storage backend."""
from pathlib import Path
from .base import StorageBackend


class LocalStorage(StorageBackend):
    """Store PDFs on the local filesystem."""
    
    def __init__(self, base_dir: str | Path):
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)
    
    def save_pdf(self, pdf_bytes: bytes, relative_path: str) -> str:
        full_path = self.base_dir / relative_path
        full_path.parent.mkdir(parents=True, exist_ok=True)
        full_path.write_bytes(pdf_bytes)
        return relative_path
    
    def get_pdf(self, relative_path: str) -> bytes:
        full_path = self.base_dir / relative_path
        if not full_path.exists():
            raise FileNotFoundError(f"PDF not found: {relative_path}")
        return full_path.read_bytes()
    
    def get_pdf_path(self, relative_path: str) -> Path:
        return self.base_dir / relative_path
    
    def exists(self, relative_path: str) -> bool:
        return (self.base_dir / relative_path).exists()
    
    def delete(self, relative_path: str) -> bool:
        full_path = self.base_dir / relative_path
        if full_path.exists():
            full_path.unlink()
            return True
        return False
