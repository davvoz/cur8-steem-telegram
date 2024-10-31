
import { displayResult } from '../components/dialog.js';
import { ApiClient } from '../api/api-client.js';
import  appInitializerInstance  from '../core/AppInitializer.js';

const client = new ApiClient();


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

export async function loginSteemLogin(username, idTelegram) {
    try {
        const result = await client.login(
            idTelegram,
            username
        );
        //displayResult(result, 'success', true);
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
            appInitializerInstance.setUsernames(result.usernames);
            appInitializerInstance.initializeEnd(result);
        });
    }
}

export async function login() {
    idTelegram = localStorage.getItem('idTelegram');
    try {
        //starta lo spinner
        document.getElementById('spinner').classList.remove('hide');
        const client = new ApiClient();
        const username = document.getElementById('username').value.toLowerCase();
        await client.login(
            idTelegram,
            username,
            document.getElementById('postingKey').value
        );
        await client.checkLogin(idTelegram).then(async (result) => {
            displayResult(result, 'success', true);
            appInitializerInstance.initializeEnd(result);
        }).then(() => {
            //termina lo spinner
            document.getElementById('spinner').classList.add('hide');
            //svuota i campi
            document.getElementById('username').value = '';
            document.getElementById('postingKey').value = '';
        });
    } catch (error) {
        console.error('Error in login:', error);
        displayResult({ error: error.message }, 'error', true);
    }
}

export function goToSteemLogin() {
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

export async function handleSteemLogin() {
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