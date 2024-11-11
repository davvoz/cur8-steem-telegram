
import { displayResult } from '../components/dialog.js';
import { ApiClient } from '../api/api-client.js';
import appInitializerInstance from '../core/AppInitializer.js';

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

export async function loginSteemLogin(username, idTelegram) {
    try {
        await client.login(
            idTelegram,
            username
        );
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
        await client.checkLogin(idTelegram).then(async (result) => {
            appInitializerInstance.initializeEnd(result);
        }).then(() => {
            document.getElementById('spinner').classList.add('hide');
            document.getElementById('username').value = '';
            document.getElementById('postingKey').value = '';
        });
    } catch (error) {
        console.error('Error in login:', error);
        const errorMessage = `${error.message}\n Wrong username or password`;
        displayResult({ error: errorMessage }, 'error', true, appInitializerInstance.initializeApp());
    }
}

export function goToHiveLogin() {
    handleCallback();
    const app = 'cur8';
    const callbackURL = window.location.origin + `${window.location.search}`;
    const scope = ['login', 'vote', 'comment', 'custom_json'];

      const authURL = `https://hivesigner.com/oauth2/authorize?client_id=${app}&redirect_uri=${encodeURIComponent(callbackURL)}&scope=${scope.join(',')}`;
      window.location.href = authURL;
}

export function goToSteemLogin() {
    handleCallback();
    // debugger
    console.log(window.location.origin + window.location.pathname +// il parametro platform 
        window.location.search);
    const steemClient = new window.steemlogin.Client({
        app: 'cur8',
        callbackURL: window.location.origin + `${window.location.search}`,
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

export async function handleSteemLogin(token, username) {
    // const accessTokenPresente = window.location.search.includes('access_token');
    const platform = localStorage.getItem('Platform');
    //console.log('accessTokenPresente:', accessTokenPresente);

    if (token && token !== 'null') {
         console.log('Token:', token);
         const idTgr = localStorage.getItem('idTelegram');
         await loginSteemLogin(username, idTgr); 
         window.history.replaceState({}, document.title, window.location.pathname); 
        } 
         else { 
            console.error('Token non presente o nullo'); 
        }
}
