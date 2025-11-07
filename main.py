from fastapi import FastAPI

# 1. Crear una instancia de la aplicación
app = FastAPI()


# 2. Definir tu primer "endpoint" o "path"
#    @app.get("/") le dice a FastAPI que esta función
#    manejará las peticiones GET a la ruta raíz ("/")
@app.get("/")
def read_root():
    # 3. Lo que devuelves (un diccionario) será enviado como JSON
    return {"message": "¡Hola, equipo! Este es nuestro micro-servicio."}


# Un endpoint de "estado" es una buena práctica
@app.get("/status")
def get_status():
    return {"status": "ok", "message": "El servicio está funcionando"}