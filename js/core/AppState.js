import { ApiClient } from '../api/api-client.js';
export class AppState {
    static instance = null;

    constructor() {
        if (AppState.instance) {
            return AppState.instance;
        }
        AppState.instance = this;

        this.listaComunities = '';
        this.scheduledTime = null;
        this.idTelegram = '';
        this.usernameSelected = '';
        this.client = new ApiClient();
        this.navigationHistory = [];
        this.telegramLoginData = null;
    }

    static getInstance() {
        if (!AppState.instance) {
            AppState.instance = new AppState();
        }
        return AppState.instance;
    }
}

// Make state globally available
export const appState = new AppState();
window.listaComunities = appState.listaComunities;
window.scheduledTime = appState.scheduledTime;
window.idTelegram = appState.idTelegram;
window.usernameSelected = appState.usernameSelected;