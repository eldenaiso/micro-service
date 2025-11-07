from fastapi import FastAPI, File, UploadFile
import shutil  # Usaremos shutil para guardar el archivo
import os      # Usaremos os para crear carpetas

# --- Tu código existente ---
app = FastAPI()

# Creamos una carpeta para guardar los archivos subidos
UPLOAD_DIRECTORY = "uploads"
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)


@app.get("/")
def read_root():
    return {"message": "¡Hola, equipo! Este es nuestro micro-servicio."}

@app.get("/status")
def get_status():
    return {"status": "ok", "message": "El servicio está funcionando"}

# --- NUEVO ENDPOINT PARA SUBIR PDFS ---

@app.post("/upload-pdf/")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Endpoint para subir un archivo PDF.
    
    - 'file: UploadFile' define que esperamos un archivo.
    - 'File(...)' indica que este campo es obligatorio.
    """
    
    # 1. Definimos la ruta donde se guardará el archivo
    #    (Ej: "uploads/mi_documento.pdf")
    file_path = os.path.join(UPLOAD_DIRECTORY, file.filename)
    
    # 2. Guardamos el archivo en el disco
    #    Usamos 'wb' (write binary) porque es un archivo, no texto.
    try:
        with open(file_path, "wb") as buffer:
            # shutil.copyfileobj copia el contenido del archivo subido
            # al archivo de destino (buffer) de forma eficiente.
            shutil.copyfileobj(file.file, buffer)
    finally:
        # Cerramos el archivo temporal
        file.file.close()

    # 3. Devolvemos una respuesta de éxito
    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "status": "archivo guardado",
        "path": file_path
    }