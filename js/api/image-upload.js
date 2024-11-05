
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

function handleDrop(e, dropZone) {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer?.files[0];
    if (file?.type.startsWith('image/')) {
        uploadImage(file);
    }
}

function handleFileSelect(e) {
    const file = e.target?.files[0];
    if (file?.type.startsWith('image/')) {
        uploadImage(file);
    }
}

let usernameSelected = 'default_username'; // Define the usernameSelected variable
let idTelegramSelected = 'default_id'; // Define the idTelegramSelected variable
export function setUsernameForImageUpload(username, idTelegram) {
    usernameSelected = username;
    idTelegramSelected = idTelegram;
}

function uploadImage(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = function () {
        document.getElementById('spinner').classList.remove('hide');
        const base64Image = reader.result.split(',')[1];

        const payload = {
            image_base64: base64Image,
            username: usernameSelected,
            id_telegram: idTelegramSelected
        };
        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.search);
        const startParam = params.get('start') || params.get('startattach') || params.get('platform');
        const baseUrlMap = {
            'STEEM': 'https://develop-imridd.eu.pythonanywhere.com/api/steem',
            'HIVE': 'https://develop-imridd.eu.pythonanywhere.com/api/hive'
        };

        fetch(baseUrlMap[startParam] + '/upload_base64_image', {
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
                displayResult({ error: error.message }, true);
            }).finally(() => {
                //permetti di caricare un'altra immagine uguale
                document.getElementById('fileInput').value = '';

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
    //posizionalmola dove si trova il cursore
    const cursorPosition = postBody.selectionStart;
    const textBefore = postBody.value.substring(0, cursorPosition);
    const textAfter = postBody.value.substring(cursorPosition);
    postBody.value = textBefore + imageMarkdown + textAfter;
}

function displayResult(result, enabled) {
    if (enabled) {
        //crea una dialog con il risultato
        const dialog = document.createElement('dialog');
        dialog.classList.add('dialog');
        dialog.innerHTML = `
        <div class="dialog-header">
            <h2>Risultato</h2>
            <button class="close-button" id="closeButton" aria-label="Chiudi">✕</button>
        </div>
        <p>${result.message || result.error}</p>
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