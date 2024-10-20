import ApiClient from './api/api-client.js';
import { initializeImageUpload } from './api/image-upload.js';
import { initializeTelegram } from './services/telegram.js';
import { displayResult } from './components/dialog.js';
import { postToSteem, salvaBozza } from './page/postPage.js';
import { showPage } from './page/page.js';
import { openComunitiesAutocomplete, openDatePicker, togglePreview } from './page/postPage.js';
import { enableNavigationButtons, initializeEnd, setUsernames } from './services/utils.js';
import { goToSteemLogin, login, loginSteemLogin } from './page/loginPage.js';

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
    { id: 'configBtn', event: 'click', handler: () => window.location.hash = '#/config' },
    { id: 'steemlogin', event: 'click', handler: goToSteemLogin }
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
window.idTelegram = '';
window.usernameSelected = '';
initializeImageUpload();


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
                    setUsernames(result.usernames);
                    enableNavigationButtons();
                    initializeEnd(result);
                } catch (error) {
                    showPage('loginPage');
                    displayResult({ error: 'Effettua il login' }, 'error', true);
                    document.getElementById('spinner').classList.add('hide');
                }
            } else {
                displayResult({ error: 'Impossibile ottenere l\'ID Telegram' }, 'error', true, () => {
                    location.reload();
                });
            }
        }).catch(error => {
            displayResult({ error: 'Errore durante l\'inizializzazione di Telegram' }, 'error', true, () => {
                location.reload();
            });
        });
    }
});





