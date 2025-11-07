from fastapi import FastAPI, File, UploadFile, HTTPException, Response
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import shutil  # Usaremos shutil para guardar el archivo
import os      # Usaremos os para crear carpetas

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permite todos los encabezados
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
        "status": "file saved",
        "path": file_path
    }

@app.get("/files")
def list_uploaded_files():
    """
    Endpoint para listar todos los archivos que se han subido.
    """
    try:
        # 1. Leemos el contenido del directorio 'uploads'
        files = os.listdir(UPLOAD_DIRECTORY)
        
        # 2. (Opcional pero recomendado) Filtramos para excluir archivos
        #    ocultos (como .DS_Store en macOS)
        visible_files = [f for f in files if not f.startswith('.')]
        
        # 3. Devolvemos la lista de archivos
        return {"files": visible_files}
    
    except Exception as e:
        # En caso de que la carpeta no exista o haya otro error
        return {"error": str(e), "files": []}
    
@app.get("/files/{file_name}")
def download_file(file_name: str):
    """
    Endpoint para descargar un archivo específico por su nombre.
    
    - '{file_name}' es un "parámetro de ruta". FastAPI pasará
    - el valor de la URL a la variable 'file_name' de la función.
    """
    
    # 1. Construimos la ruta completa al archivo
    file_path = os.path.join(UPLOAD_DIRECTORY, file_name)
    
    # 2. Verificamos si el archivo existe
    if not os.path.isfile(file_path):
        # Si no existe, lanzamos un error 404
        raise HTTPException(status_code=404, detail="File not found")
    
    # 3. Devolvemos el archivo usando FileResponse
    #    Esto automáticamente le dirá al navegador que descargue el archivo.
    return FileResponse(path=file_path, media_type='application/octet-stream', filename=file_name)

@app.delete("/files/{file_name}")
def delete_file(file_name: str):
    """
    Endpoint para eliminar un archivo específico por su nombre.
    Usa el método HTTP DELETE.
    """
    
    # 1. Construimos la ruta completa al archivo
    file_path = os.path.join(UPLOAD_DIRECTORY, file_name)
    
    # 2. Verificamos si el archivo existe
    if not os.path.isfile(file_path):
        # Si no existe, lanzamos un error 404
        raise HTTPException(status_code=404, detail="File not found")
        
    try:
        # 3. Intentamos eliminar el archivo del disco
        os.remove(file_path)
    except Exception as e:
        # Si algo sale mal (ej. permisos), lanzamos un error 500
        raise HTTPException(status_code=500, detail=f"Error deleting file: {e}")

    # 4. Devolvemos una respuesta de éxito (sin contenido, código 204)
    #    o podemos devolver un JSON simple.
    return {"status": "deleted", "file": file_name}