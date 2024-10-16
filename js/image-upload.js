
export function initializeImageUpload() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });
    dropZone.addEventListener('drop', (e) => handleDrop(e, dropZone));
    fileInput.addEventListener('change', handleFileSelect);
}

function handleDrop(e,dropZone) {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        uploadImage(file);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        uploadImage(file);
    }
}

let usernameSelected = 'default_username'; // Define the usernameSelected variable

export function setUsernameForImageUpload(username) {
    usernameSelected = username;
}

function uploadImage(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = function () {
        document.getElementById('spinner').classList.remove('hide');
        const base64Image = reader.result.split(',')[1];

        const payload = {
            image_base64: base64Image,
            username: usernameSelected
        };

        fetch('https://imridd.eu.pythonanywhere.com/api/steem/upload_base64_image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Telegram-Data': window.Telegram?.WebApp?.initData 
            },
            body: JSON.stringify(payload)
        })
            .then(response => response.json())
            .then(data => {
                const imageUrl = data.image_url;
                insertImageUrlInTextarea(imageUrl);
                document.getElementById('spinner').classList.add('hide');
            })
            .catch(error => {
                console.error('Errore durante il caricamento dell\'immagine:', error);
                displayResult({ error: error.message }, 'error', true);
            });
    };

    reader.onerror = function (error) {
        console.error('Errore durante la lettura del file:', error);
        displayResult({ error: error.message }, 'error', true);
    };
}

function insertImageUrlInTextarea(url) {
    const postBody = document.getElementById('postBody');
    const imageMarkdown = `![Immagine](${url})`;
    postBody.value += postBody.value ? `\n${imageMarkdown}` : imageMarkdown;
}

function displayResult(result, type = 'success', enabled) {
    if (enabled) {
        //crea una dialog con il risultato
        const dialog = document.createElement('dialog');
        dialog.classList.add('dialog');
        dialog.innerHTML = `
        <h2>Risultato</h2>
        <p>${result.message || result.error}</p>
        <button id="closeButton" class="action-btn">Chiudi</button>
        `;
        document.body.appendChild(dialog);
        dialog.showModal();

        const closeButton = document.getElementById('closeButton');
        closeButton.addEventListener('click', () => {
            dialog.remove();
        });
    }

}

//usage
// import { initializeImageUpload } from './image-upload.js';
// import { initializeApp } from './ui-utils.js';
// import { ApiClient } from './api-client.js';
//  
// const client = new ApiClient();
// initializeApp('your_user_id', client);
// initializeImageUpload();
//