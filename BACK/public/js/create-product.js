document.addEventListener('DOMContentLoaded', () => {
    const btnGenerate = document.getElementById('btn-generate-ai');
    const txtDescription = document.getElementById('descripcion');
    const previewContainer = document.getElementById('preview-container');
    const inputRutaImg = document.getElementById('ruta_img');
    const previewImage = document.getElementById('preview-image');
    const loadingMessage = document.getElementById('loading-message');

    if (btnGenerate) {
        btnGenerate.addEventListener('click', async (e) => {
            e.preventDefault();

            const description = txtDescription.value.trim();
            if (!description) {
                alert('Por favor, escribe una descripción para generar la imagen.');
                return;
            }

            // UI Loading State
            btnGenerate.disabled = true;
            btnGenerate.textContent = '⏳ Generando...';
            loadingMessage.style.display = 'block';
            previewContainer.style.display = 'none';

            try {
                const response = await fetch('/api/productos/preview-image', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ descripcion: description })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Error al generar imagen');
                }

                // Success
                previewImage.src = data.url;
                inputRutaImg.value = data.url;
                previewContainer.style.display = 'block';

            } catch (error) {
                console.error('Error:', error);
                alert('Error al generar la imagen: ' + error.message);
            } finally {
                btnGenerate.disabled = false;
                btnGenerate.textContent = '✨ Generar con IA';
                loadingMessage.style.display = 'none';
            }
        });
    }
});
