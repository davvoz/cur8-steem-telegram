
import { getDialogTelegramId } from '../components/dialog.js';

export const initializeTelegram = async () => {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
        return window.Telegram.WebApp.initDataUnsafe.user.id;
    }
    // Wait for Telegram to initialize
    return getDialogTelegramId();
};

export default class TelegramService {
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

