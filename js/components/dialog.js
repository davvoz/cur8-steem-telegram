import { translations } from '../i18n/translations.js';
function t(key) {
    const lang = localStorage.getItem('language') || 'en';
    return translations[lang][key] || key;
}
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
        <h2>${t('telegram_id')}</h2>
        <input type="text" id="telegramId" placeholder="${t('enter_telegram_id')}">
        <button id="confirmButtonTelegramId" class="action-btn">${t('confirm')}</button>
    `;
    return dialog;
};

const closeAndResolve = async (dialog, value, resolve) => {
    dialog.close();
    dialog.remove();
    await resolve(value);
};

export function displayResult(result, type, enabled, callback, time) {
    if (enabled) {
        const dialog = document.createElement('dialog');
        dialog.classList.add('dialog');
        switch (type) {
            case 'success':
                dialog.innerHTML = `
                <div class="dialog-header">
                    <h2>${t('result')}</h2>
                    <button class="close-button" id="closeButton" aria-label="${t('close')}">✕</button>
                </div>
                <p>${result.message}</p>
                `;
                break;
            case 'error':
                dialog.innerHTML = `
                <div class="dialog-header">
                    <h2>${t('msg_error')}</h2>
                    <button class="close-button" id="closeButton" aria-label="${t('close')}">✕</button>
                </div>
                <p>${result.error}</p>
                `;
                break;
            case 'custom':
                dialog.innerHTML = `
                <div class="dialog-header">
                    <h2>${result.title}</h2>
                    <button class="close-button" id="closeButton" aria-label="${t('close')}">✕</button>
                </div>
                <p>${result.message}</p>
                `;
                break;
            default:
                dialog.innerHTML = `
                <div class="dialog-header">
                    <h2>${t('information')}</h2>
                    <button class="close-button" id="closeButton" aria-label="${t('close')}">✕</button>
                </div>
                <p>${result.info}</p>
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
        if (typeof time !== 'undefined') {
            setTimeout(() => {
                dialog.remove();
            }, time);
        }
    }
}

export function createDatePickerDialog() {
    const dialog = document.createElement('dialog');
    dialog.classList.add('dialogo');
    const header = document.createElement('div');
    header.classList.add('dialog-header');

    const title = document.createElement('h2');
    title.textContent = t('post_scheduling');
    header.appendChild(title);

    const closeButton = document.createElement('button');
    closeButton.classList.add('close-button');
    closeButton.id = 'closeButton';
    closeButton.setAttribute('aria-label', t('close'));
    closeButton.textContent = '✕';
    header.appendChild(closeButton);

    const input = document.createElement('input');
    input.type = 'datetime-local';
    input.id = 'scheduledTime';
    input.name = 'scheduledTime';

    const confirmButton = document.createElement('button');
    confirmButton.id = 'confirmButtonDP';
    confirmButton.classList.add('action-btn');
    confirmButton.textContent = t('confirm');

    const cancelButton = document.createElement('button');
    cancelButton.id = 'annullaButtonDP';
    cancelButton.classList.add('action-btn');
    cancelButton.textContent = t('cancel');

    dialog.appendChild(header);
    dialog.appendChild(input);
    dialog.appendChild(confirmButton);
    dialog.appendChild(cancelButton);
    return dialog;
}

export function communityDialog() {
    const dialog = document.createElement('dialog');
    dialog.classList.add('c-dialogo');
    const header = document.createElement('div');
    header.classList.add('dialog-header');

    const title = document.createElement('h2');
    title.textContent = t('select_community');
    header.appendChild(title);

    const closeButton = document.createElement('button');
    closeButton.classList.add('close-button');
    closeButton.id = 'closeButton';
    closeButton.setAttribute('aria-label', t('close'));
    closeButton.textContent = '✕';
    header.appendChild(closeButton);

    const container = document.createElement('div');
    container.classList.add('c-container');

    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'myInput';
    input.placeholder = t('community_search');
    container.appendChild(input);

    const autocompleteList = document.createElement('div');
    autocompleteList.id = 'autocomplete-list';
    autocompleteList.classList.add('autocomplete-items');
    container.appendChild(autocompleteList);

    const autocompleteContainer = document.createElement('div');
    autocompleteContainer.classList.add('autocomplete-container');
    autocompleteContainer.appendChild(header);
    autocompleteContainer.appendChild(container);

    dialog.appendChild(autocompleteContainer);
    return dialog;
}