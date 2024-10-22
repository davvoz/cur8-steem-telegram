export  class TelegramManager {
    static instance = null;

    constructor() {
        if (TelegramManager.instance) {
            return TelegramManager.instance;
        }
        TelegramManager.instance = this;
    }

    static getInstance() {
        if (!TelegramManager.instance) {
            TelegramManager.instance = new TelegramManager();
        }
        return TelegramManager.instance;
    }

    setupBackButton() {
        if (!window.Telegram?.WebApp) return;

        window.Telegram.WebApp.BackButton.show();
        window.Telegram.WebApp.BackButton.onClick(() => {
            console.log('Back button clicked', window.location.hash, window.location, window.history);
            window.history.back();
        });
    }

    hideBackButton() {
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.BackButton.hide();
        }
    }
}