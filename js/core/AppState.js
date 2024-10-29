import { ApiClient } from '../api/api-client.js';
import { Router } from '../router/Router.js';

export class AppState {
    static instance = null;

    constructor() {
        if (AppState.instance) {
            return AppState.instance;
        }
        AppState.instance = this;
        this.currentDraft = null;
        this.listaComunities = '';
        this.scheduledTime = null;
        this.idTelegram = '';
        this.usernameSelected = '';
        this.client = new ApiClient();
        this.navigationHistory = [];
        this.telegramLoginData = null;
        this._router = null;
    }

    get router() {
        if (!this._router) {
            this._router = Router.getInstance();
        }
        return this._router;
    }

    static getInstance() {
        if (!AppState.instance) {
            AppState.instance = new AppState();
        }
        return AppState.instance;
    }

    setCurrentDraft(draft) {
        this.currentDraft = draft;
    }

    getCurrentDraft() {
        return this.currentDraft;
    }
}

// Make state globally available
export const appState = new AppState();
window.listaComunities = appState.listaComunities;
window.scheduledTime = appState.scheduledTime;
window.idTelegram = appState.idTelegram;
window.usernameSelected = appState.usernameSelected;
