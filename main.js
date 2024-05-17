   
        async function startCapture() {
            const video = document.getElementById('video');
            const canvas = document.getElementById('canvas');
            const context = canvas.getContext('2d');

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                video.srcObject = stream;
                video.style.display = 'block';

                // Captura una foto cuando el usuario toca la pantalla
                video.addEventListener('click', () => {
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const imageData = canvas.toDataURL('image/png');
                    const img = document.createElement('img');
                    img.src = imageData;
                    document.getElementById('captureImages').appendChild(img);

                    // Detener el video
                    video.style.display = 'none';
                    stream.getTracks().forEach(track => track.stop());
                });
            } catch (err) {
                console.error('Error al acceder a la cámara: ', err);
                alert('No se puede acceder a la cámara.');
            }
        }

        async function convertToPDF() {
            const captureImagesDiv = document.getElementById('captureImages');
            const imageElements = captureImagesDiv.getElementsByTagName('img');

            if (imageElements.length === 0) {
                alert('Primero debes capturar al menos una imagen.');
                return;
            }

            const pdfDoc = await PDFLib.PDFDocument.create();

            for (let img of imageElements) {
                const imageBytes = await fetch(img.src).then(res => res.arrayBuffer());
                const pngImage = await pdfDoc.embedPng(imageBytes);
                const page = pdfDoc.addPage([pngImage.width, pngImage.height]);
                page.drawImage(pngImage, {
                    x: 0,
                    y: 0,
                    width: pngImage.width,
                    height: pngImage.height,
                });
            }

            const pdfBytes = await pdfDoc.save();

            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'documento.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }