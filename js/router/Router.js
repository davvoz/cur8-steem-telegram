import { TelegramManager } from '../core/TelegramManager.js';
import { appState } from '../core/AppState.js';
import { showPage } from '../services/pageService.js';
export class Router {
    constructor() {
        if (Router.instance) {
            return Router.instance;
        }

        this.routes = {
            '/': this.showAccountPage,
            '/post': this.showPostPage,
            '/draft': this.showDraftPage,
            '/login': this.showLoginPage,
            '/config': this.showConfigPage,
            '/draft/edit/:id': this.showPostPage.bind(this), // Add new route for draft editing

        };
        this.navigationHistory = appState.navigationHistory;

        Router.instance = this;
       
    }

    parseRoute(path) {
        // Check if path matches any route pattern with parameters
        for (const [pattern, handler] of Object.entries(this.routes)) {
            const regexPattern = pattern.replace(/:\w+/g, '([^/]+)');
            const regex = new RegExp(`^${regexPattern}$`);
            const match = path.match(regex);
            
            if (match) {
                const params = match.slice(1);
                return { handler, params };
            }
        }
        
        // Direct route match
        return { handler: this.routes[path], params: [] };
    }

    showAccountPage() {
        window.Telegram.WebApp.BackButton.hide();
        showPage('accountPage');
        // if (window.Telegram?.WebApp) {
        //     window.Telegram.WebApp.BackButton.hide();
        // }
    }

    showPostPage() {
        window.Telegram.WebApp.BackButton.hide();
        showPage('postPage');
        // TelegramManager.getInstance().setupBackButton();
    }

    showDraftPage() {
        showPage('draftPage');
        window.Telegram.WebApp.BackButton.hide();
        //TelegramManager.getInstance().setupBackButton();
    }

    showLoginPage() {
        showPage('loginPage');
        TelegramManager.getInstance().setupBackButton();
    }

    showConfigPage() {
        showPage('configPage');
        window.Telegram.WebApp.BackButton.hide();
        //TelegramManager.getInstance().setupBackButton();
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
        
        const { handler, params } = this.parseRoute(path);
        if (handler) {
            handler(...params);
            //this.updateBackButton();
        } else {
            console.log('404 Not Found');
        }
    }

    static getInstance() {
        if (!Router.instance) {
            Router.instance = new Router();
        }
        return Router.instance;
    }
}

// Usage
//const router = Router.getInstance();