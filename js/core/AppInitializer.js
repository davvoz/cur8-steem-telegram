import { initializeTelegram } from '../services/telegram.js';
import { displayResult } from '../components/dialog.js';
import { enableNavigationButtons } from '../services/utils.js';
import { ApiClient } from '../api/api-client.js';
import { showPage } from '../services/pageService.js';
import { appState } from './AppState.js';
import { setUsernameForImageUpload } from '../api/image-upload.js';
import { getListaComunities } from '../services/utils.js';
import { AccountManager } from '../pages/accountListPage.js';

// App Initializer Class
let usernames = [];
const accountManager = new AccountManager();

export class AppInitializer {
    static async initializeApp() {

        try {
            const idTelegram = await initializeTelegram();
            console.log('initializeTelegram resolved with idTelegram:', idTelegram);
            localStorage.setItem('idTelegram', idTelegram);

            if (!idTelegram) {
                throw new Error('Impossibile ottenere l\'ID Telegram');
            }

            appState.client = new ApiClient();
            document.getElementById('spinner').classList.remove('hide');

            const result = await appState.client.checkLogin(idTelegram);
            if (!result.usernames) {
                document.getElementById('spinner').classList.add('hide');
                displayResult({ error: 'Nessun account trovato' }, 'error', true);
                return;
            }
            this.initializeAccountList(result.usernames);
            setUsernames(result.usernames);
            enableNavigationButtons();
            AppInitializer.initializeEnd(result);
        } catch (error) {
            AppInitializer.handleInitializationError(error);
        } finally {
            document.getElementById('spinner').classList.add('hide');
        }
    }

    static async initializeAccountList(usernames) {
        usernames.forEach(username => accountManager.createAccountListItem(username));
    }

    static handleInitializationError(error) {
        if (error.message.includes('HTTP error! status: 404')) {
            displayResult(
                { info: 'Complimenti! 🎉 Perché non aggiungere un tuo account? 😊' },
                'info',
                true,
                () => showPage('loginPage')
            );
        } else {
            displayResult(
                { error: error.message || 'Errore durante l\'inizializzazione ricarica la pagina' },
                'error',
                true
            );
        }
    }

    static initializeEnd(result) {
        enableNavigationButtons();
        console.log('initializeEnd', result);
        window.listaComunities = getListaComunities();
        usernames = result.usernames;
        const accountList = document.getElementById('accountList');
        accountList.innerHTML = '';
        this.initializeAccountList(usernames);
        if (usernames.length > 0) {
            window.usernameSelected = usernames[0];
            setUsernameForImageUpload(window.usernameSelected.username, localStorage.getItem('idTelegram'));
            const firstAccountContainer = accountList.querySelector('.container-username');
            if (firstAccountContainer) {
                accountManager.selectAccount(window.usernameSelected, firstAccountContainer);
            }
        }
        document.getElementById('spinner').classList.add('hide');
        showPage('accountPage');
        displayResult(result);
    }


}
export function getUsernames() {
    return usernames;
}

export function setUsernames(value) {
    usernames = value;
}