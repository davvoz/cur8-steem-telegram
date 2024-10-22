import { initializeTelegram } from '../services/telegram.js';
import { displayResult } from '../components/dialog.js';
import { enableNavigationButtons, initializeEnd, setUsernames } from '../services/utils.js';
import { ApiClient } from '../api/api-client.js';
import { showPage } from '../services/pageService.js';
import { appState } from './AppState.js';   
// App Initializer Class
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

            setUsernames(result.usernames);
            enableNavigationButtons();
            initializeEnd(result);
        } catch (error) {
            AppInitializer.handleInitializationError(error);
        } finally {
            document.getElementById('spinner').classList.add('hide');
        }
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
}