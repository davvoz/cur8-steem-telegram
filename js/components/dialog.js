export const getDialogTelegramId = () => {
    return new Promise((resolve) => {
        const dialog = createDialogo();
        document.body.appendChild(dialog);
        dialog.showModal();

        const confirmButton = dialog.querySelector('#confirmButtonTelegramId');
        confirmButton.addEventListener('click', () => {
            document.getElementById('spinner').classList.remove('hide');
            const telegramId = document.getElementById('telegramId').value;
            localStorage.setItem('idTelegram', telegramId);
            closeAndResolve(dialog, telegramId, resolve).then(() => {
                return telegramId;

            });
        });
        dialog.addEventListener('close', () => {
            closeAndResolve(dialog, null, resolve);
        });
    });
};

const createDialogo = () => {
    const dialog = document.createElement('dialog');
    dialog.classList.add('dialogo');
    dialog.innerHTML = `
        <h2>Telegram ID</h2>
        <input type="text" id="telegramId" placeholder="Inserisci il tuo ID Telegram">
        <button id="confirmButtonTelegramId" class="action-btn">Conferma</button>
    `;
    return dialog;
};

const closeAndResolve = async (dialog, value, resolve) => {
    dialog.close();
    dialog.remove();
    await resolve(value);
};

export function displayResult(result, type = 'success', enabled = false, callback, time = 2000) {
    if (enabled) {
        //crea una dialog con il risultato
        const dialog = document.createElement('dialog');
        dialog.classList.add('dialog');
        switch (type) {
            case 'success':
                dialog.innerHTML = `
                <h2>Risultato</h2>
                <p>${result.message}</p>
                <button id="closeButton" class="action-btn">Chiudi</button>
                `;
                break;
            case 'error':
                dialog.innerHTML = `
                <h2>Errore</h2>
                <p>${result.error}</p>
                <button id="closeButton" class="action-btn">Chiudi</button>
                `;
                break;
            case 'custom':
                dialog.innerHTML = `
                <h2>${result.title}</h2>
                <p>${result.message}</p>
                <button id="closeButton" class="action-btn">Chiudi</button>
                `;
                break;
            default:
                dialog.innerHTML = `
                <h2>Informazione</h2>
                <p>${result.info}</p>
                <button id="closeButton" class="action-btn">Chiudi</button>
                `;
        }
        document.body.appendChild(dialog);
        dialog.classList.add(type);
        dialog.showModal();
        const closeButton = dialog.querySelector('#closeButton');
        closeButton.addEventListener('click', () => {
            dialog.remove();
            if (callback) {
                callback();
            }
        });

        dialog.addEventListener('close', () => dialog.remove());
        if (type !== 'error' && (!callback || !result.neverClose)) {
            setTimeout(() => {
                dialog.remove();
            }, time);
        }
    }
}

export function createDatePickerDialog() {
    const dialog = document.createElement('dialog');
    dialog.classList.add('dialogo');
    dialog.innerHTML = `
    <div class="dialog-header">
        <h2>Seleziona la data e l'ora di pubblicazione</h2>
        <button class="close-button" id="closeButton" aria-label="Chiudi">✕</button>
    </div>
        <input type="datetime-local" id="scheduledTime" name="scheduledTime">
        <button id="confirmButtonDP" class="action-btn">Conferma</button>
        <button id="annullaButtonDP" class="action-btn">Cancella</button>
    `;
    return dialog;
}

export function communityDialog() {
    const dialog = document.createElement('dialog');
    dialog.classList.add('c-dialogo');
    dialog.innerHTML = `
        <div class="autocomplete-container">
            <div class="dialog-header">
                <h2>Seleziona la comunità</h2>
                <button class="close-button" id="closeButton" aria-label="Chiudi">✕</button>
            </div>
            <div class="c-container">
                <input 
                    type="text" 
                    id="myInput" 
                    placeholder="Inizia a digitare..."
                >
                <div id="autocomplete-list" class="autocomplete-items"></div>
            </div>
        </div>
    `;
    return dialog;
}