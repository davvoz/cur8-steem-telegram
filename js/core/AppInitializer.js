import { initializeTelegram } from '../services/telegram.js';
import { displayResult } from '../components/dialog.js';
import { enableNavigationButtons } from './utils.js';
import { ApiClient } from '../api/api-client.js';
import { showPage } from '../services/pageService.js';
import { appState } from './AppState.js';
import { setUsernameForImageUpload } from '../api/image-upload.js';
import { getListaComunities } from './utils.js';
import { AccountManager } from '../pages/accountListPage.js';

class AppInitializer {
    constructor() {
        if (AppInitializer.instance) {
            return AppInitializer.instance;
        }

        // Ottieni l'URL corrente
        const url = new URL(window.location.href);

        // Crea un oggetto URLSearchParams per leggere i parametri della query string
        const params = new URLSearchParams(url.search);

        // Accedi al valore del parametro start (o startattach)
        const startParam = params.get('start') || params.get('startattach');

        if (startParam) {
            console.log("Start parameter:", startParam);
        } else {
            console.log("Start parameter non presente.");
        }


        this.usernames = [];
        this.accountManager = new AccountManager();
        AppInitializer.instance = this;
    }

    async initializeApp() {
        try {
            const idTelegram = await initializeTelegram();
            console.log('initializeTelegram resolved with idTelegram:', idTelegram);
            localStorage.setItem('idTelegram', idTelegram);

            if (!idTelegram) {
                throw new Error('Unable to obtain Telegram ID');
            }

            appState.client = new ApiClient();
            this.showSpinner();

            const result = await appState.client.checkLogin(idTelegram);
            if (!result.usernames) {
                this.handleNoUsernamesFound();
                return;
            }
            this.initializeAccountList(result.usernames);
            this.setUsernames(result.usernames);
            enableNavigationButtons();
            this.initializeEnd(result);
        } catch (error) {
            this.handleInitializationError(error);
        } finally {
            this.hideSpinner();
        }
    }

    handleNoUsernamesFound() {
        this.hideSpinner();
        this.perfotmGoToLoginPage();
    }

    perfotmGoToLoginPage() {
        showPage('loginPage');
    }

    async initializeAccountList(usernames) {
        usernames.forEach(username => this.accountManager.createAccountListItem(username));
    }

    handleInitializationError(error) {
        console.error('Error in handleInitializationError:', error);
        displayResult(
            { error: error.message || 'Error during initialization, please reload the page' },
            'error',
            true
        );
    }

    initializeEnd(result) {
        enableNavigationButtons();
        console.log('initializeEnd', result);
        window.listaComunities = getListaComunities();
        this.usernames = result.usernames;
        this.updateAccountList(this.usernames);
        if (this.usernames.length > 0) {
            this.selectFirstAccount(this.usernames);
        }
        this.hideSpinner();
        showPage('accountPage');
        //displayResult(result);
    }

    updateAccountList(usernames) {
        const accountList = document.getElementById('accountList');
        accountList.innerHTML = '';
        this.initializeAccountList(usernames);
    }

    selectFirstAccount(usernames) {
        window.usernameSelected = usernames[0];
        setUsernameForImageUpload(window.usernameSelected.username, localStorage.getItem('idTelegram'));
        const firstAccountContainer = document.getElementById('accountList').querySelector('.container-username');
        if (firstAccountContainer) {
            this.accountManager.selectAccount(window.usernameSelected, firstAccountContainer);
        }
    }

    showSpinner() {
        document.getElementById('spinner').classList.remove('hide');
    }

    hideSpinner() {
        document.getElementById('spinner').classList.add('hide');
    }

    getUsernames() {
        return this.usernames;
    }

    setUsernames(value) {
        this.usernames = value;
    }
}

const appInitializerInstance = new AppInitializer();
export default appInitializerInstance;


//usage in other files:
// import appInitializerInstance from './AppInitializer.js';
