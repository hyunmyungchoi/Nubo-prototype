from fastapi import FastAPI

app = FastAPI(title="Nubo API")


@app.get("/api/health")
def health():
    return {"status": "ok"}