import { TelegramManager } from '../core/TelegramManager.js';
import { appState } from '../core/AppState.js';
import { showPage } from '../services/pageService.js';
export class Router {
    constructor() {
        this.routes = {
            '/': this.showAccountPage,
            '/post': this.showPostPage,
            '/draft': this.showDraftPage,
            '/login': this.showLoginPage,
            '/config': this.showConfigPage
        };
        this.navigationHistory = appState.navigationHistory;
    }

    showAccountPage() {
        showPage('accountPage');
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.BackButton.hide();
        }
    }

    showPostPage() {
        showPage('postPage');
        TelegramManager.getInstance().setupBackButton();
    }

    showDraftPage() {
        showPage('draftPage');
        TelegramManager.getInstance().setupBackButton();
    }

    showLoginPage() {
        showPage('loginPage');
        TelegramManager.getInstance().setupBackButton();
    }

    showConfigPage() {
        showPage('configPage');
        TelegramManager.getInstance().setupBackButton();
    }

    updateBackButton() {
        if (!window.Telegram?.WebApp) return;

        if (this.navigationHistory.length > 1) {
            window.Telegram.WebApp.BackButton.show();
            window.Telegram.WebApp.BackButton.onClick(() => {
                this.navigationHistory.pop();
                const previousPage = this.navigationHistory[this.navigationHistory.length - 1];
                window.location.hash = previousPage;
            });
        } else {
            window.Telegram.WebApp.BackButton.hide();
        }
    }

    handleRoute() {
        const path = window.location.hash.slice(1) || '/';
        this.navigationHistory.push(path);

        const route = this.routes[path];
        if (route) {
            route();
            this.updateBackButton();
        } else {
            console.log('404 Not Found');
        }
    }
}