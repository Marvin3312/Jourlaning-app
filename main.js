async function startCapture() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    if (!video || !canvas || !context) {
        console.error('No se encontraron los elementos de video o canvas.');
        return;
    }

    try {
        // Solicitar acceso al sensor principal trasero
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: { exact: 'environment' } } 
        });

        video.srcObject = stream;
        video.style.display = 'block';

        video.onloadedmetadata = () => {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = canvas.toDataURL('image/png');
            const imgElement = document.createElement('img');
            imgElement.src = imageData;
            document.getElementById('captureImages').appendChild(imgElement);
            video.style.display = 'none';
            stream.getTracks().forEach(track => track.stop());
        };
    } catch (err) {
        console.error('Error al acceder al sensor principal trasero: ', err);
    }
}


async function convertToPDF() {
    const captureImagesDiv = document.getElementById('captureImages');
    const images = captureImagesDiv.getElementsByTagName('img');
    if (images.length === 0) {
        alert('Primero debes capturar al menos una imagen.');
        return;
    }

    const pdfDoc = await PDFLib.PDFDocument.create();

    for (let img of images) {
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

    // Descargar el PDF generado
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'documento.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
