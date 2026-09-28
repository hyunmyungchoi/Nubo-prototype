import json
from pathlib import Path

from fastapi import FastAPI

from app.schemas.notice import Notice

app = FastAPI(title="Nubo API")

DATA_PATH = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "notices.json"
)


@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.get("/api/notices", response_model=list[Notice])
def get_notices() -> list[Notice]:
    content = DATA_PATH.read_text(encoding="utf-8-sig")
    records = json.loads(content)

    return [Notice.model_validate(record) for record in records]