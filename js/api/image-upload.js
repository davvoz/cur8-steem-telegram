const MAX_FILE_SIZE_MB = 15;
const UPLOAD_TIMEOUT_MS = 60000; // 60 secondi di timeout

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
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        // Controlla la dimensione del file
        if (isFileSizeValid(file)) {
            uploadImage(file);
        }
    }
}

let usernameSelected = 'default_username'; // Define the usernameSelected variable
let idTelegramSelected = 'default_id'; // Define the idTelegramSelected variable
export function setUsernameForImageUpload(username,idTelegram) {
    usernameSelected = username;
    idTelegramSelected = idTelegram;
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        // Controlla la dimensione del file
        if (isFileSizeValid(file)) {
            uploadImage(file);
        }
    }
}

// Funzione per controllare la dimensione del file
function isFileSizeValid(file) {
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > MAX_FILE_SIZE_MB) {
        displayResult({ 
            error: `L'immagine è troppo grande. La dimensione massima consentita è ${MAX_FILE_SIZE_MB}MB.` 
        }, 'error', true);
        return false;
    }
    return true;
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

        // Crea una Promise per gestire il timeout
        const fetchWithTimeout = (url, options, timeout) => {
            return Promise.race([
                fetch(url, options),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout: Il caricamento sta impiegando troppo tempo.')), timeout)
                )
            ]);
        };

        const platform = localStorage.getItem('platform');

        const baseUrlMap = {
            'STEEM': 'https://develop-imridd.eu.pythonanywhere.com/api/hive/upload_base64_image',
            'HIVE': 'https://develop-imridd.eu.pythonanywhere.com/api/hive/upload_base64_image'
        };

        const baseUrl = baseUrlMap[platform] || (() => {
            console.error('Invalid start parameter:', platform);
        })();

        // Esegui la richiesta con timeout
        fetchWithTimeout(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Telegram-Data': window.Telegram?.WebApp?.initData 
            },
            body: JSON.stringify(payload)
        }, UPLOAD_TIMEOUT_MS)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Errore nella risposta del server');
                }
                return response.json();
            })
            .then(data => {
                const imageUrl = data.image_url;
                insertImageUrlInTextarea(imageUrl);
            })
            .catch(error => {
                console.error('Errore durante il caricamento dell\'immagine:', error);
                let errorMessage = error.message;
                if (error.message.includes('Timeout')) {
                    errorMessage = 'The image is taking too long to load, check your connection and try again later. ';
                }
                displayResult({ error: errorMessage }, 'error', true);
            })
            .finally(() => {
                document.getElementById('fileInput').value = '';
                document.getElementById('spinner').classList.add('hide');
            });
    };

    reader.onerror = function (error) {
        console.error('Error during reading file', error);
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

function displayResult(result, type = 'success', enabled) {
    if (enabled) {
        const dialog = document.createElement('dialog');
        dialog.classList.add('dialog');
        
        // Aggiungi classi CSS per lo stile in base al tipo di messaggio
        dialog.classList.add(`dialog-${type}`);
        
        dialog.innerHTML = `
        <div class="dialog-header">
            <h2>${type === 'success' ? 'Success' : 'Error'}</h2>
            <button class="close-button" id="closeButton" aria-label="Close">✕</button>
        </div>
        <div class="dialog-content">
            <p>${result.message || result.error}</p>
        </div>
        `;
        
        document.body.appendChild(dialog);
        dialog.showModal();

        const autoCloseTimeout = setTimeout(() => {
            if (dialog && document.body.contains(dialog)) {
                dialog.remove();
            }
        }, 5000);

        const closeButton = dialog.querySelector('#closeButton');
        closeButton.addEventListener('click', () => {
            clearTimeout(autoCloseTimeout);
            dialog.remove();
        });

        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                clearTimeout(autoCloseTimeout);
                dialog.remove();
            }
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