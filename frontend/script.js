const API_URL = "http://127.0.0.1:8000";

document.addEventListener("DOMContentLoaded", () => {
    // Referencias a elementos
    const uploadForm = document.getElementById("uploadForm");
    const fileInput = document.getElementById("fileInput");
    const fileList = document.getElementById("fileList");
    const refreshButton = document.getElementById("refreshButton");
    
    // --- NUEVOS ELEMENTOS ---
    const notificationArea = document.getElementById("notificationArea");
    const confirmModal = document.getElementById("confirmModal");
    const modalText = document.getElementById("modalText");
    const modalConfirmBtn = document.getElementById("modalConfirmBtn");
    const modalCancelBtn = document.getElementById("modalCancelBtn");

    // Variable para guardar el archivo a eliminar
    let fileToDelete = null;

    // --- NUEVA FUNCIÓN DE NOTIFICACIÓN ---
    /**
     * Muestra un mensaje en el área de notificación.
     * @param {string} message - El mensaje a mostrar.
     * @param {string} type - 'success', 'error', o 'info'
     */
    function showNotification(message, type = 'info') {
        notificationArea.textContent = message;
        notificationArea.className = `notification-area ${type}`; // Asigna clase para color
        notificationArea.style.display = 'block';

        // Opcional: Ocultar la notificación después de 5 segundos
        setTimeout(() => {
            if (notificationArea.textContent === message) { // Solo oculta si es el mismo msg
                notificationArea.style.display = 'none';
            }
        }, 5000);
    }

    // --- Lógica de subida (actualizada para usar notificaciones) ---
    uploadForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const file = fileInput.files[0];
        if (!file) {
            showNotification("Please select a file.", 'error');
            return;
        }
        const formData = new FormData();
        formData.append("file", file);

        showNotification("Uploading...", 'info');
        try {
            const response = await fetch(`${API_URL}/upload-pdf/`, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                showNotification(`File "${file.name}" uploaded successfully!`, 'success');
                fileInput.value = "";
                fetchFiles();
            } else {
                throw new Error("Error uploading file.");
            }
        } catch (error) {
            console.error("Upload Error:", error);
            showNotification("Error uploading file. Check the console.", 'error');
        }
    });

    // --- Lógica de la lista de archivos (actualizada) ---
    refreshButton.addEventListener("click", fetchFiles);

    async function fetchFiles() {
        fileList.innerHTML = "<li>Loading...</li>";
        try {
            const response = await fetch(`${API_URL}/files`);
            const data = await response.json();
            fileList.innerHTML = "";
            
            if (data.files && data.files.length > 0) {
                data.files.forEach(fileName => {
                    // ... (código para crear li, span, actionsDiv, downloadLink)
                    const li = document.createElement("li");
                    const span = document.createElement("span");
                    span.textContent = fileName;
                    li.appendChild(span);
                    const actionsDiv = document.createElement("div");
                    actionsDiv.className = "actions";
                    const downloadLink = document.createElement("a");
                    downloadLink.href = `${API_URL}/files/${fileName}`;
                    downloadLink.textContent = "Download";
                    downloadLink.className = "download-btn";
                    downloadLink.target = "_blank";
                    actionsDiv.appendChild(downloadLink);

                    // --- LÓGICA DE ELIMINACIÓN ACTUALIZADA ---
                    const deleteButton = document.createElement("button");
                    deleteButton.textContent = "Delete";
                    deleteButton.className = "delete-btn";
                    
                    // Ya no llama a deleteFile, llama a promptDelete
                    deleteButton.onclick = () => promptDelete(fileName);
                    
                    actionsDiv.appendChild(deleteButton);
                    li.appendChild(actionsDiv);
                    fileList.appendChild(li);
                });
            } else {
                fileList.innerHTML = "<li>No files have been uploaded.</li>";
            }
        } catch (error) {
            console.error("Fetch Files Error:", error);
            fileList.innerHTML = "<li>Error loading files.</li>";
        }
    }

    // --- NUEVAS FUNCIONES PARA EL MODAL DE ELIMINACIÓN ---

    /**
     * 1. Abre el modal de confirmación
     */
    function promptDelete(fileName) {
        fileToDelete = fileName; // Guarda el archivo que queremos borrar
        modalText.textContent = `Are you sure you want to delete "${fileName}"?`;
        confirmModal.style.display = 'flex'; // Muestra el modal
    }

    /**
     * 2. Cierra el modal (botón Cancelar)
     */
    modalCancelBtn.addEventListener("click", () => {
        confirmModal.style.display = 'none';
        fileToDelete = null;
    });

    /**
     * 3. Confirma la eliminación (botón "Yes, Delete")
     */
    modalConfirmBtn.addEventListener("click", () => {
        if (fileToDelete) {
            executeDelete(fileToDelete); // Llama a la función que hace el fetch
        }
        confirmModal.style.display = 'none';
        fileToDelete = null;
    });

    /**
     * 4. Lógica de fetch que antes estaba en deleteFile()
     */
    async function executeDelete(fileName) {
        try {
            const response = await fetch(`${API_URL}/files/${fileName}`, {
                method: "DELETE",
            });

            if (response.ok) {
                showNotification(`File "${fileName}" deleted.`, 'success'); // <-- Reemplaza alert
                fetchFiles(); // Recargar la lista
            } else {
                throw new Error("Error deleting file.");
            }
        } catch (error) {
            console.error("Delete File Error:", error);
            showNotification("Error deleting file.", 'error'); // <-- Reemplaza alert
        }
    }

    // Cargar archivos al inicio
    fetchFiles();
});