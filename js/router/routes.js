import { showPage } from '../services/pageService.js';
import TelegramService from '../services/telegram.js';


const telegramService = new TelegramService();
const platform = localStorage.getItem('platform')

export const routes = () => ({
    [`/?platform=${platform}/`]: () => {
        showPage('accountPage');
        telegramService.hideBackButton();
    },
    [`/?platform=${platform}/post`]: () => {
        showPage('postPage');
        telegramService.hideBackButton();
        //telegramService.setupBackButton();
    },
    [`/?platform=${platform}/draft`]: () => {
        showPage('draftPage');
        telegramService.hideBackButton();
        //telegramService.setupBackButton();
    },
    [`/?platform=${platform}/login`]: () => {
        showPage('loginPage');
        telegramService.setupBackButton();
    },
    [`/?platform=${platform}/config`]: () => {
        showPage('configPage');
        telegramService.hideBackButton();
        //telegramService.setupBackButton();
    }
});