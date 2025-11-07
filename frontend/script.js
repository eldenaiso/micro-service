// ¡IMPORTANTE! Cambia esto si tu API corre en otro puerto.
const API_URL = "http://127.0.0.1:8000";

document.addEventListener("DOMContentLoaded", () => {
    const uploadForm = document.getElementById("uploadForm");
    const fileInput = document.getElementById("fileInput");
    const uploadStatus = document.getElementById("uploadStatus");
    const fileList = document.getElementById("fileList");
    const refreshButton = document.getElementById("refreshButton");

    // --- 1. Cargar la lista de archivos al iniciar ---
    fetchFiles();

    // --- 2. Refrescar la lista al hacer clic en el botón ---
    refreshButton.addEventListener("click", fetchFiles);

    // --- 3. Manejar la subida de archivos ---
    uploadForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // Evitar que el formulario se envíe de forma tradicional
        
        const file = fileInput.files[0];
        if (!file) {
            uploadStatus.textContent = "Por favor, selecciona un archivo.";
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        uploadStatus.textContent = "Subiendo...";
        try {
            const response = await fetch(`${API_URL}/upload-pdf/`, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                uploadStatus.textContent = `Archivo "${file.name}" subido con éxito!`;
                fileInput.value = ""; // Limpiar el input
                fetchFiles(); // Recargar la lista de archivos
            } else {
                throw new Error("Error al subir el archivo.");
            }
        } catch (error) {
            console.error("Error en upload:", error);
            uploadStatus.textContent = "Error al subir el archivo. Revisa la consola.";
        }
    });

    // --- Función para OBTENER y mostrar los archivos ---
    async function fetchFiles() {
        fileList.innerHTML = "<li>Cargando...</li>"; // Limpiar lista
        try {
            const response = await fetch(`${API_URL}/files`);
            const data = await response.json();

            fileList.innerHTML = ""; // Limpiar lista
            if (data.files && data.files.length > 0) {
                data.files.forEach(fileName => {
                    const li = document.createElement("li");
                    
                    // Nombre del archivo
                    const span = document.createElement("span");
                    span.textContent = fileName;
                    li.appendChild(span);

                    // Contenedor para botones
                    const actionsDiv = document.createElement("div");
                    actionsDiv.className = "actions";

                    // Botón de Descargar (es un simple enlace)
                    const downloadLink = document.createElement("a");
                    downloadLink.href = `${API_URL}/files/${fileName}`;
                    downloadLink.textContent = "Descargar";
                    downloadLink.className = "download-btn";
                    downloadLink.target = "_blank"; // Abrir en nueva pestaña
                    actionsDiv.appendChild(downloadLink);

                    // Botón de Eliminar
                    const deleteButton = document.createElement("button");
                    deleteButton.textContent = "Eliminar";
                    deleteButton.className = "delete-btn";
                    deleteButton.onclick = () => deleteFile(fileName); // Asignar evento
                    actionsDiv.appendChild(deleteButton);

                    li.appendChild(actionsDiv);
                    fileList.appendChild(li);
                });
            } else {
                fileList.innerHTML = "<li>No hay archivos subidos.</li>";
            }
        } catch (error) {
            console.error("Error en fetchFiles:", error);
            fileList.innerHTML = "<li>Error al cargar los archivos.</li>";
        }
    }

    // --- Función para ELIMINAR un archivo ---
    async function deleteFile(fileName) {
        if (!confirm(`¿Estás seguro de que quieres eliminar "${fileName}"?`)) {
            return; // No hacer nada si el usuario cancela
        }

        try {
            const response = await fetch(`${API_URL}/files/${fileName}`, {
                method: "DELETE",
            });

            if (response.ok) {
                alert(`Archivo "${fileName}" eliminado.`);
                fetchFiles(); // Recargar la lista
            } else {
                throw new Error("Error al eliminar el archivo.");
            }
        } catch (error) {
            console.error("Error en deleteFile:", error);
            alert("Error al eliminar el archivo.");
        }
    }
});