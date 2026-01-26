from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import tempfile

from src.main import process_file

app = FastAPI(title="Autonomous Insurance Claims Processing Agent")

# CORS (frontend integration)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
         "https://synapx-assignment.netlify.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Claims API running ✅. Open /docs for Swagger UI."}

@app.post("/process")
async def process_claim(file: UploadFile = File(...)):
    suffix = "." + file.filename.split(".")[-1]

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    return process_file(tmp_path)
