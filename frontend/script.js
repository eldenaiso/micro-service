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
        e.preventDefault(); 
        
        const file = fileInput.files[0];
        if (!file) {
            uploadStatus.textContent = "Please select a file."; // <-- Traducido
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        uploadStatus.textContent = "Uploading..."; // <-- Traducido
        try {
            const response = await fetch(`${API_URL}/upload-pdf/`, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                uploadStatus.textContent = `File "${file.name}" uploaded successfully!`; // <-- Traducido
                fileInput.value = ""; 
                fetchFiles(); 
            } else {
                throw new Error("Error uploading file."); // <-- Traducido
            }
        } catch (error) {
            console.error("Upload Error:", error); // <-- Traducido
            uploadStatus.textContent = "Error uploading file. Check the console."; // <-- Traducido
        }
    });

    // --- Función para OBTENER y mostrar los archivos ---
    async function fetchFiles() {
        fileList.innerHTML = "<li>Loading...</li>"; // <-- Traducido
        try {
            const response = await fetch(`${API_URL}/files`);
            const data = await response.json();

            fileList.innerHTML = ""; 
            if (data.files && data.files.length > 0) {
                data.files.forEach(fileName => {
                    const li = document.createElement("li");
                    
                    const span = document.createElement("span");
                    span.textContent = fileName;
                    li.appendChild(span);

                    const actionsDiv = document.createElement("div");
                    actionsDiv.className = "actions";

                    // Botón de Descargar
                    const downloadLink = document.createElement("a");
                    downloadLink.href = `${API_URL}/files/${fileName}`;
                    downloadLink.textContent = "Download"; // <-- Traducido
                    downloadLink.className = "download-btn";
                    downloadLink.target = "_blank"; 
                    actionsDiv.appendChild(downloadLink);

                    // Botón de Eliminar
                    const deleteButton = document.createElement("button");
                    deleteButton.textContent = "Delete"; // <-- Traducido
                    deleteButton.className = "delete-btn";
                    deleteButton.onclick = () => deleteFile(fileName); 
                    actionsDiv.appendChild(deleteButton);

                    li.appendChild(actionsDiv);
                    fileList.appendChild(li);
                });
            } else {
                fileList.innerHTML = "<li>No files have been uploaded.</li>"; // <-- Traducido
            }
        } catch (error) {
            console.error("Fetch Files Error:", error); // <-- Traducido
            fileList.innerHTML = "<li>Error loading files.</li>"; // <-- Traducido
        }
    }

    // --- Función para ELIMINAR un archivo ---
    async function deleteFile(fileName) {
        if (!confirm(`Are you sure you want to delete "${fileName}"?`)) { // <-- Traducido
            return; 
        }

        try {
            const response = await fetch(`${API_URL}/files/${fileName}`, {
                method: "DELETE",
            });

            if (response.ok) {
                alert(`File "${fileName}" deleted.`); // <-- Traducido
                fetchFiles(); 
            } else {
                throw new Error("Error deleting file."); // <-- Traducido
            }
        } catch (error) {
            console.error("Delete File Error:", error); // <-- Traducido
            alert("Error deleting file."); // <-- Traducido
        }
    }
});