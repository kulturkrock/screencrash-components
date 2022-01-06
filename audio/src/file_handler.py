from pathlib import Path

class FileHandler:

    def __init__(self, resource_path: Path):
        self._resource_path = resource_path

    def write_file(self, path: Path, data: bytes):
        full_path = self._resource_path / path
        full_path.parent.mkdir(parents=True, exist_ok=True)
        with open(full_path, "wb") as f:
            f.write(data)
        print("Wrote file " + str(path))