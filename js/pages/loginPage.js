
import { displayResult } from '../components/dialog.js';
import { ApiClient } from '../api/api-client.js';
import appInitializerInstance from '../core/AppInitializer.js';
import { Url_parameters } from '../services/parameters.js';

const client = new ApiClient();

function updateStatus(message) {
    displayResult({ info: message }, 'info', true);
}

function handleCallback() {
    console.log('Handling callback');
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const state = urlParams.get('state');
    if (state) {
        const savedState = sessionStorage.getItem('steemLoginState');
        if (state === savedState) {
            updateStatus('Login successful');
            console.log("HANDLE CALLBACK", getSteemloginUsername(accessToken));
            window.history.replaceState({}, document.title, window.location.pathname);
        } else {
            updateStatus('Error: State does not match');
        }
        sessionStorage.removeItem('steemLoginState');
    }
}

async function getSteemloginUsername(accessToken) {
    if (!accessToken) {
        updateStatus('User not logged in. Unable to retrieve data.');
        return;
    }
    try {
        const response = await fetch('https://api.steemlogin.com/api/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (!response.ok) {
            throw new Error('API request error');
        }
        const userData = await response.json();
        console.log('User data:', userData);
        await loginSteemLogin(userData.username);
        displayUserData(userData);
    } catch (error) {
        console.error('Error retrieving user data:', error);
        updateStatus('Error retrieving user data: ' + error.message);
    }
}

function displayUserData(userData) {
    const dialog = document.createElement('dialog');
    dialog.classList.add('dialogo');
    dialog.innerHTML = `
        <h2>User Data</h2>
        <ul>
            ${Object.entries(userData).map(([key, value]) => `<li>${key}: ${value}</li>`).join('')}
        </ul>      
        <button id="closeButton" class="action-btn">Close</button>
    `;
    document.body.appendChild(dialog);
    dialog.showModal();
    const closeButton = dialog.querySelector('#closeButton');
    closeButton.addEventListener('click', () => {
        dialog.remove();
    });
    dialog.addEventListener('close', () => dialog.remove());
}

export async function SignersLogin(username, idTelegram) {
    try {
        await client.signerlogin(idTelegram, username);
    } catch (error) {
        console.error('Error in login:', error);
        displayResult({ error: errorMessage }, 'error', true);
    } finally {
        document.getElementById('spinner').classList.remove('hide');
        await client.checkLogin(idTelegram).then(async (result) => {
            if (typeof result.usernames === 'undefined') {
                document.getElementById('spinner').classList.add('hide');
                return;
            }
            appInitializerInstance.setUsernames(result.usernames);
            appInitializerInstance.initializeEnd(result);
        });
    }
}

export async function login() {
    const idTelegram = localStorage.getItem('idTelegram');
    try {
        document.getElementById('spinner').classList.remove('hide');
        const client = new ApiClient();
        const username = document.getElementById('username').value.toLowerCase();
        await client.login(
            idTelegram,
            username,
            document.getElementById('postingKey').value
        );
        await client.checkLogin(idTelegram)
            .then(async (result) => {
                appInitializerInstance.initializeEnd(result);
            }).then(() => {
                document.getElementById('spinner').classList.add('hide');
                document.getElementById('username').value = '';
                document.getElementById('postingKey').value = '';
            });
    } catch (error) {
        const callback = () => {
            document.getElementById('spinner').classList.add('hide');
        }   
        console.error('Error in login:', error);
        const errorMessage = `Wrong username or password, please use your private posting key.`;
        displayResult({ error: errorMessage }, 'error', true,
            //andare su loginPage
            callback);
    }

}

export function goToSteemLogin() {
    handleCallback();
    console.log(window.location.origin + window.location.pathname +// il parametro platform 
        window.location.search);
    const steemClient = new window.steemlogin.Client({
        app: 'cur8',
        callbackURL: window.location.origin + window.location.search,
        scope: ['login', 'vote', 'comment', 'custom_json'],
    });

    try {
        const state = Math.random().toString(36).substring(7);
        const loginUrl = steemClient.getLoginURL(state);
        sessionStorage.setItem('steemLoginState', state);
        console.log('Login URL:', steemClient);
        window.location.href = loginUrl;
    } catch (error) {
        console.error('Error during the login process:', error);
        updateStatus('Error during the login process: ' + error.message);
    }
}

export function goToHiveLogin() {
    handleCallback();
    const app = 'cur8';
    const callbackURL = window.location.origin + window.location.search;
    const scope = ['login', 'vote', 'comment', 'custom_json'];

    const authURL = `https://hivesigner.com/oauth2/authorize?client_id=${app}&redirect_uri=${encodeURIComponent(callbackURL)}&scope=${scope.join(',')}`;
    window.location.href = authURL;
}

export async function hive_keychain() {
    if (typeof window.hive_keychain === 'undefined') {
        alert('Hive Keychain non è installato. Si prega di installarlo per continuare.');
        return;
    }

    try {
        const username = 'menny.trx'; // Sostituisci con il tuo username Hive

        // Richiesta di login
        const response = await window.hive_keychain.requestSignBuffer(username, 'Login to my app', 'Active');

        if (response) {
            console.log('Login avvenuto con successo!', response);
            // Qui puoi gestire la logica di login, ad esempio salvare il token o l'utente
        } else {
            console.log('Login fallito.');
        }
    } catch (error) {
        console.error('Errore durante il login:', error);
    }
}

export async function handleSignersLogin(platform, token, username) {
    console.log('accessTokenPresente:', token);
    console.log('Token:', token);
    console.log('Username:', username);
    console.log(`justPlatform setted: ${platform}`)
    const idTgr = localStorage.getItem('idTelegram');
    await SignersLogin(username, idTgr);
    const newUrl = `${window.location.pathname}?platform=${platform}`;
    window.history.replaceState({}, document.title, newUrl);
}
