from fastapi import FastAPI, File, UploadFile, HTTPException, Response
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional  # <-- Importación corregida
import shutil
import os

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Creamos una carpeta para guardar los archivos subidos
UPLOAD_DIRECTORY = "uploads"
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)


@app.get("/")
def read_root():
    return {"message": "Hello, team! This is our microservice."}


@app.get("/status")
def get_status():
    return {"status": "ok", "message": "Service is running"}


@app.post("/upload-pdf/")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Endpoint para subir un archivo PDF.
    """
    file_path = os.path.join(UPLOAD_DIRECTORY, file.filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    finally:
        file.file.close()

    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "status": "file saved",
        "path": file_path
    }


# --- ¡ESTE ES EL ENDPOINT QUE FALTABA! ---
@app.get("/files")
def list_uploaded_files():
    """
    Endpoint para listar todos los archivos que se han subido.
    """
    try:
        files = os.listdir(UPLOAD_DIRECTORY)
        visible_files = [f for f in files if not f.startswith('.')]
        return {"files": visible_files}
    except Exception as e:
        return {"error": str(e), "files": []}


# --- ESTA ES LA FUNCIÓN ÚNICA Y CORRECTA PARA "VER" Y "DESCARGAR" ---
@app.get("/files/{file_name}")
def get_file(file_name: str, action: Optional[str] = None):
    """
    Endpoint para obtener un archivo.
    - Por defecto (sin 'action'), fuerza la descarga.
    - Con '?action=view', intenta mostrarlo en el navegador.
    """
    
    file_path = os.path.join(UPLOAD_DIRECTORY, file_name)
    
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    if action == 'view':
        # Devuelve el archivo como PDF, lo que los navegadores intentarán mostrar
        return FileResponse(path=file_path, media_type='application/pdf')
    
    # Comportamiento por defecto: Forzar la descarga
    return FileResponse(path=file_path, media_type='application/octet-stream', filename=file_name)

# --- LA FUNCIÓN "download_file" DUPLICADA HA SIDO ELIMINADA ---


@app.delete("/files/{file_name}")
def delete_file(file_name: str):
    """
    Endpoint para eliminar un archivo específico por su nombre.
    Usa el método HTTP DELETE.
    """
    
    file_path = os.path.join(UPLOAD_DIRECTORY, file_name)
    
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="File not found")
        
    try:
        os.remove(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting file: {e}")

    return {"status": "deleted", "file": file_name}