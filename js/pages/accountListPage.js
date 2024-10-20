import { displayResult } from '../components/dialog.js';
import { applySavedTheme } from '../components/theme.js';
import { setUsernameForImageUpload } from '../api/image-upload.js';
import { getUserDrafts } from './draftPage.js';
import ApiClient from '../api/api-client.js';
import { setUsernames } from '../services/utils.js';

export function createAccountListItem(username) {
    const li = document.createElement('li');
    const container = document.createElement('div');
    container.classList.add('container-username');
    const imgNameContainer = document.createElement('div');
    imgNameContainer.style.display = 'flex';
    imgNameContainer.style.flexDirection = 'row';
    imgNameContainer.style.alignItems = 'center';

    const img = document.createElement('img');
    img.alt = `${username.username}'s profile image`;
    img.classList.add('profile-image-thumbnail'); // Add a class for thumbnail styling
    if (username.profile_image) {
        img.src = username.profile_image;
    } else {
        img.src = 'https://fonts.gstatic.com/s/i/materialiconsoutlined/account_circle/v6/24px.svg'; // URL for material icon
    }

    const spanUSername = document.createElement('span');
    spanUSername.innerText = username.username;
    spanUSername.classList.add('usernameElement');

    container.onclick = () => {
        selectAccount(username, container);
        window.usernameSelected = username;
        document.getElementById('titleGestionBozze').innerText = `Gestione Bozze di ${window.usernameSelected.username}`;
    };

    const buttonsContainer = document.createElement('div');
    const logoutButton = document.createElement('button');
    logoutButton.classList.add('action-btn');
    logoutButton.innerText = 'Logout';
    logoutButton.onclick = () => {
        window.usernameSelected = '';
        handleLogout(username.username);
    };

    buttonsContainer.classList.add('buttons-container');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.flexDirection = 'row';
    buttonsContainer.style.flexWrap = 'nowrap';
    buttonsContainer.style.justifyContent = 'flex-end';
    buttonsContainer.style.alignItems = 'baseline';

    buttonsContainer.appendChild(logoutButton);
    imgNameContainer.appendChild(img);
    imgNameContainer.appendChild(spanUSername);
    container.appendChild(imgNameContainer);
    container.appendChild(buttonsContainer);
    li.appendChild(container);
    document.getElementById('accountList').appendChild(li);
}

export function selectAccount(username, containerElement) {
    window.usernameSelected = username;
    document.querySelectorAll('.container-username').forEach(el => {
        el.classList.remove('selected');
    });

    containerElement.classList.add('selected');
    displayResult({ message: `Account ${username.username} selected` }, 'success');
    getUserDrafts(); // Carica i draft quando si seleziona un account
    applySavedTheme(); // Carica il tema salvato quando si seleziona un account
    setUsernameForImageUpload(username.username, localStorage.getItem('idTelegram'));
}

async function handleLogout(username) {
    const dialog = document.createElement('dialog');
    dialog.classList.add('dialogo');
    dialog.innerHTML = `
        <h2>Conferma Logout</h2>
        <p>Sei sicuro di voler effettuare il logout?</p>
        <button id="confirmButtonLogout" class="action-btn">Conferma</button>
        <button id="cancelButtonLogout" class="action-btn">Annulla</button>
    `;
    document.body.appendChild(dialog);
    dialog.showModal();
    const confirmButton = dialog.querySelector('#confirmButtonLogout');
    const cancelButton = dialog.querySelector('#cancelButtonLogout');
    confirmButton.addEventListener('click', async () => {
        dialog.remove();
        try {
            const client = new ApiClient();
            let id = localStorage.getItem('idTelegram');
            const result = await client.logout(id, username).then(() => {
            }).finally(async () => {
                await client.checkLogin(id).then(async (result) => {
                    if (typeof result.usernames === 'undefined') {
                        displayResult({ error: 'Nessun account trovato' }, 'error', true);
                        return;
                    }
                    setUsernames(result.usernames);
                    // TODO non so se serve
                    initializeEnd(result);
                }).finally(() => {
                    document.getElementById('spinner').classList.add('hide');
                });
            });
            displayResult(result, 'success');
        } catch (error) {
            document.getElementById('spinner').classList.remove('hide');
            console.error('Error in handleLogout:', error);
            displayResult({ error: error.message }, 'error');
        }
    });
    cancelButton.addEventListener('click', () => {
        dialog.remove();
    });

    dialog.addEventListener('close', () => {
        dialog.remove();
    });
}   