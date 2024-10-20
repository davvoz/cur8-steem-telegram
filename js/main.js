// Imports
import ApiClient from './api/api-client.js';
import { initializeImageUpload } from './api/image-upload.js';
import { initializeTelegram } from './services/telegram.js';
import { displayResult } from './components/dialog.js';
import { postToSteem, salvaBozza, openComunitiesAutocomplete, openDatePicker, togglePreview } from './pages/postPage.js';
import { showPage } from './pages/page.js';
import { enableNavigationButtons, initializeEnd, setUsernames } from './services/utils.js';
import { goToSteemLogin, login, loginSteemLogin } from './pages/loginPage.js';

// Global variables
window.listaComunities = '';
window.scheduledTime = null;
window.idTelegram = '';
window.usernameSelected = '';
let client = new ApiClient();

// Router configuration
const routes = {
    '/': showAccountPage,
    '/post': showPostPage,
    '/draft': showDraftPage,
    '/login': showLoginPage,
    '/config': showConfigPage
};

const navigationHistory = [];

// Event listeners
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

// Functions
function initializeEventListeners() {
    eventListeners.forEach(({ id, event, handler }) => {
        document.getElementById(id)?.addEventListener(event, handler);
    });
}

function updateBackButton() {
    if (window.Telegram?.WebApp) {
        if (navigationHistory.length > 1) {
            window.Telegram.WebApp.BackButton.show();
            window.Telegram.WebApp.BackButton.onClick(() => {
                navigationHistory.pop();
                let previousPage = navigationHistory[navigationHistory.length - 1];
                window.location.hash = previousPage;
            });
        } else {
            window.Telegram.WebApp.BackButton.hide();
        }
    }
}

function router() {
    const path = window.location.hash.slice(1) || '/';
    navigationHistory.push(path);
    const route = routes[path];
    if (route) {
        route();
        updateBackButton();
    } else {
        console.log('404 Not Found');
    }
}

function setupTelegramBackButton() {
    if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.BackButton.show();
        window.Telegram.WebApp.BackButton.onClick(() => {
            console.log('Back button clicked', window.location.hash, window.location, window.history);
            window.history.back();
        });
    }
}

function showAccountPage() {
    showPage('accountPage');
    if (window.Telegram?.WebApp) {
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

async function handleSteemLogin() {
    const accessTokenPresente = window.location.search.includes('access_token');
    console.log('accessTokenPresente:', accessTokenPresente);

    if (accessTokenPresente) {
        const token = window.location.search.split('access_token=')[1];
        console.log('Token:', token);

        const username = window.location.search.split('username=')[1].split('&expires_in=')[0];
        console.log('Username:', username);

        const idTgr = localStorage.getItem('idTelegram');
        await loginSteemLogin(username, idTgr);
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

async function initializeApp() {
    try {
        const idTelegram = await initializeTelegram();
        console.log('initializeTelegram resolved with idTelegram:', idTelegram);
        localStorage.setItem('idTelegram', idTelegram);

        if (idTelegram) {
            client = new ApiClient();
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
        } else {
            throw new Error('Impossibile ottenere l\'ID Telegram');
        }
    } catch (error) {
        showPage('loginPage');
        displayResult({ error: error.message || 'Errore durante l\'inizializzazione' }, 'error', true, () => {
            location.reload();
        });
    } finally {
        document.getElementById('spinner').classList.add('hide');
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    router();
    initializeEventListeners();
    initializeImageUpload();

    await handleSteemLogin();
    if (!window.location.search.includes('access_token')) {
        await initializeApp();
    }

    // Add input event listeners to remove error class when user starts typing
    ['postTitle', 'postBody', 'postTags'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', function () {
            this.classList.remove('error');
        });
    });
});

window.addEventListener('hashchange', router);