export const getDialogTelegramId = () => {
    return new Promise((resolve) => {
        const dialog = createDialogo();
        document.body.appendChild(dialog);
        dialog.showModal();

        const confirmButton = dialog.querySelector('#confirmButtonTelegramId');
        confirmButton.addEventListener('click', () => {
            document.getElementById('spinner').classList.remove('hide');
            const telegramId = document.getElementById('telegramId').value;
            closeAndResolve(dialog, telegramId, resolve).then(() => {
                idTelegram = telegramId;
                localStorage.setItem('idTelegram', telegramId);
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
        if (type !== 'error' && (!callback || !neverClose)) {
            setTimeout(() => {
                dialog.remove();
            }, time);
        }
    }
}