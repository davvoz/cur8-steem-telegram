
import { getDialogTelegramId } from './dialog.js';

export const initializeTelegram = async () => {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
        return window.Telegram.WebApp.initDataUnsafe.user.id;
    }
    return getDialogTelegramId();
};