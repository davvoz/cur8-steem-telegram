import ApiClient from './api/api-client.js';
import { initializeImageUpload, setUsernameForImageUpload } from './api/image-upload.js';
import { applySavedTheme } from './components/theme.js';
import { initializeTelegram } from './services/telegram.js';
import { displayResult } from './components/dialog.js';
import { postToSteem, salvaBozza } from './page/postPage.js';
import { showPage } from './page/page.js';
import { getUserDrafts } from './page/draftPage.js';
import { openComunitiesAutocomplete, openDatePicker,togglePreview } from './page/postPage.js';

const eventListeners = [
    { id: 'goLogin', event: 'click', handler: login },
    { id: 'openComunities', event: 'click', handler: openComunitiesAutocomplete },
    { id: 'previewBtn', event: 'click', handler: togglePreview },
    { id: 'openDatePicker', event: 'click', handler: openDatePicker },
    { id: 'postToSteem', event: 'click', handler: postToSteem },
    { id: 'salvaBozza', event: 'click', handler: salvaBozza },
    { id: 'postBtn', event: 'click', handler: () => window.location.hash = '#/post' },
    { id: 'draftBtn', event: 'click', handler: () => window.location.hash = '#/draft' },
    { id: 'accountBtn', event: 'click', handler: () => window.location.hash = '#/' },
    { id: 'loginInBtn', event: 'click', handler: () => window.location.hash = '#/login' },
    { id: 'configBtn', event: 'click', handler: () => window.location.hash = '#/config' }

];

function router() {
    const path = window.location.hash.slice(1) || '/';
    const route = routes[path];
    if (route) {
        route();
        if (path === '/') {
            if (window.Telegram && window.Telegram.WebApp) {
                window.Telegram.WebApp.BackButton.hide();
            }
        } else {
            setupTelegramBackButton();
        }
    } else {
        console.log('404 Not Found');
    }
}

const routes = {
    '/': showAccountPage,
    '/post': showPostPage,
    '/draft': showDraftPage,
    '/login': showLoginPage,
    '/config': showConfigPage
};

eventListeners.forEach(({ id, event, handler }) => {
    document.getElementById(id).addEventListener(event, handler);
});

window.listaComunities = '';
window.scheduledTime = null;
let client = new ApiClient();
let usernames = [];
window.idTelegram = '';
window.usernameSelected = '';
initializeImageUpload();



async function getListaComunities() {
    try {
        const result = await client.listaComunities();
        displayResult(result, 'success');
        return result;
    } catch (error) {
        console.error('Error in getListaComunities:', error);
        displayResult({ error: error.message }, 'error');
    }
}


function updateStatus(message) {
    displayResult({ info: message }, 'info', true);
}


function handleCallback() {
    console.log('Handling callback');
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const state = urlParams.get('state');
    console.log('Url params:', urlParams);
    if (state) {
        const savedState = sessionStorage.getItem('steemLoginState');
        if (state === savedState) {
            //scrivilo nel local storage
            updateStatus('Login effettuato con successo');
            // Rimuovi i parametri dall'URL
            console.log("HANDLE CALLBACK", getSteemloginUsername(accessToken));
            window.history.replaceState({}, document.title, window.location.pathname);
        } else {
            updateStatus('Errore: Stato non corrispondente');
        }
        sessionStorage.removeItem('steemLoginState');
    }

}

async function getSteemloginUsername(accessToken) {
    if (!accessToken) {
        updateStatus('Utente non loggato. Impossibile ottenere i dati.');
        return;
    }

    try {
        const response = await fetch('https://api.steemlogin.com/api/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Errore nella richiesta API');
        }

        const userData = await response.json();
        console.log('Dati utente:', userData);

        await loginSteemLogin(userData.username);
        displayUserData(userData);
    } catch (error) {
        console.error('Errore durante il recupero dei dati utente:', error);
        updateStatus('Errore durante il recupero dei dati utente: ' + error.message);
    }
}

function displayUserData(userData) {
    const dialog = document.createElement('dialog');
    dialog.classList.add('dialogo');
    dialog.innerHTML = `
        <h2>Dati Utente</h2>
        <ul>
            ${Object.entries(userData).map(([key, value]) => `<li>${key}: ${value}</li>`).join('')}
        </ul>
        <button id="closeButton" class="action-btn">Chiudi</button>
    `;
    document.body.appendChild(dialog);
    dialog.showModal();
    const closeButton = dialog.querySelector('#closeButton');
    closeButton.addEventListener('click', () => {
        dialog.remove();
    });
    dialog.addEventListener('close', () => dialog.remove());
}


function initializeEnd(result) {
    enableNavigationButtons();
    console.log('initializeEnd', result);
    window.listaComunities = getListaComunities();
    usernames = result.usernames;
    const accountList = document.getElementById('accountList');
    accountList.innerHTML = '';
    usernames.forEach(createAccountListItem);
    if (usernames.length > 0) {
        window.usernameSelected = usernames[0];
        document.getElementById('titleGestionBozze').innerText = `Gestione Bozze di ${window.usernameSelected.username}`;
        setUsernameForImageUpload(window.usernameSelected.username, localStorage.getItem('idTelegram'));
        usernameSelected = usernames[0];
        const firstAccountContainer = accountList.querySelector('.container-username');
        if (firstAccountContainer) {
            selectAccount(window.usernameSelected, firstAccountContainer);
        }
    }
    document.getElementById('spinner').classList.add('hide');
    showPage('accountPage');
    displayResult(result);
}

function createAccountListItem(username) {
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

function selectAccount(username, containerElement) {
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
            //attiva lo spinner
            let id = localStorage.getItem('idTelegram');
            const result = await client.logout(id, username).then(() => {
                //ferma lo spinner
            }).finally(async () => {
                await client.checkLogin(id).then(async (result) => {
                    if (typeof result.usernames === 'undefined') {
                        //termina lo spinner
                        displayResult({ error: 'Nessun account trovato' }, 'error', true);
                        return;
                    }
                    usernames = result.usernames;
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

function enableNavigationButtons() {
    ['draftBtn', 'postBtn', 'accountBtn', 'configBtn'].forEach(id => {
        document.getElementById(id).disabled = false;
    });
}

async function loginSteemLogin(username, idTelegram) {
    try {
        const result = await client.login(
            idTelegram,
            username
        );
        displayResult(result, 'success', true);
    } catch (error) {
        console.error('Error in login:', error);
        displayResult({ error: error.message }, 'error', true);
    } finally {
        document.getElementById('spinner').classList.remove('hide');
        await client.checkLogin(idTelegram).then(async (result) => {
            if (typeof result.usernames === 'undefined') {
                //termina lo spinner
                document.getElementById('spinner').classList.add('hide');
                displayResult({ error: 'Nessun account trovato' }, 'error', true);
                return;
            }
            usernames = result.usernames;
            initializeEnd(result);
        });
    }
}

async function login() {
    idTelegram = localStorage.getItem('idTelegram');
    alert
    try {
        await client.login(
            idTelegram,
            document.getElementById('username').value,
            document.getElementById('postingKey').value
        );
        await client.checkLogin(idTelegram).then(async (result) => {
            displayResult(result, 'success', true);
            initializeEnd(result);
        });

    } catch (error) {
        console.error('Error in login:', error);
        displayResult({ error: error.message }, 'error', true);
    }
}

function showAccountPage() {
    showPage('accountPage');
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.BackButton.hide();
    }
}

function showPostPage() {
    showPage('postPage');
    setupTelegramBackButton();
}

function showDraftPage() {
    showPage('draftPage');
    setupTelegramBackButton();
}

function showLoginPage() {
    showPage('loginPage');
    setupTelegramBackButton();
}

function showConfigPage() {
    showPage('configPage');
    setupTelegramBackButton();
}

function setupTelegramBackButton() {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.BackButton.show();
        window.Telegram.WebApp.BackButton.onClick(() => {
            console.log('Back button clicked' + window.location.hash, window.location, window.history);
            window.history.back();
        });
    }
}


// Add input event listeners to remove error class when user starts typing
['postTitle', 'postBody', 'postTags'].forEach(id => {
    document.getElementById(id).addEventListener('input', function () {
        this.classList.remove('error');
    });
});

window.addEventListener('hashchange', router);
document.addEventListener('DOMContentLoaded', async () => {
    router();
    //controlla se abbiamo un access_token
    const accessTokenPresente = window.location.search.includes('access_token');
    console.log('accessTokenPresente:', accessTokenPresente);

    if (accessTokenPresente) {
        const token = window.location.search.split('access_token=')[1];
        console.log('Token:', token);

        //dobbiamo eliminare dall 'username la parte successiva &expires_in=604800&state=okxlnj"
        const username = window.location.search.split('username=')[1].split('&expires_in=')[0];

        console.log('Username:', username);
        const idTgr = localStorage.getItem('idTelegram');
        await loginSteemLogin(username, idTgr);
        window.history.replaceState({}, document.title, window.location.pathname);
    } else {
        initializeTelegram().then(async idTelegram => {
            console.log('initializeTelegram resolved with idTelegram:', idTelegram);
            localStorage.setItem('idTelegram', idTelegram);
            if (idTelegram) {
                client = new ApiClient();
                try {
                    document.getElementById('spinner').classList.remove('hide');
                    const result = await client.checkLogin(idTelegram);
                    if (typeof result.usernames === 'undefined') {
                        document.getElementById('spinner').classList.add('hide');
                        displayResult({ error: 'Nessun account trovato' }, 'error', true);
                        return;
                    }
                    usernames = result.usernames;
                    enableNavigationButtons();
                    initializeEnd(result);
                } catch (error) {
                    showPage('loginPage');
                    displayResult({ error: 'Effettua il login' }, 'error', true);
                    console.error('Error in initialize app:', error);
                    document.getElementById('spinner').classList.add('hide');
                }
            } else {
                displayResult({ error: 'Impossibile ottenere l\'ID Telegram' }, 'error', true, () => {
                    location.reload();
                });
            }
        }).catch(error => {
            console.error('Errore durante l\'inizializzazione di Telegram:', error);
            displayResult({ error: 'Errore durante l\'inizializzazione di Telegram' }, 'error', true, () => {
                location.reload();
            });
        });
    }
});


document.getElementById('steemlogin').addEventListener('click', goToSteemLogin);

function goToSteemLogin() {
    handleCallback();
    const steemClient = new window.steemlogin.Client({
        app: 'cur8',
        callbackURL: window.location.origin + window.location.pathname,
        scope: ['login', 'vote', 'comment', 'custom_json'],
    });

    try {
        const state = Math.random().toString(36).substring(7);
        const loginUrl = steemClient.getLoginURL(state);
        sessionStorage.setItem('steemLoginState', state);
        console.log('Login URL:', steemClient);
        window.location.href = loginUrl;
    } catch (error) {
        console.error('Errore durante il processo di login:', error);
        updateStatus('Errore durante il processo di login: ' + error.message);
    }
}

