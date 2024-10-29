import { showPage } from '../services/pageService.js';
import TelegramService from '../services/telegram.js';


const telegramService = new TelegramService();

export const routes = {
    '/': () => {
        showPage('accountPage');
        telegramService.hideBackButton();
    },
    '/post': () => {
        showPage('postPage');
        telegramService.hideBackButton();
        //telegramService.setupBackButton();
    },
    '/draft': () => {
        showPage('draftPage');
        telegramService.hideBackButton();
        //telegramService.setupBackButton();
    },
    '/login': () => {
        showPage('loginPage');
        telegramService.setupBackButton();
    },
    '/config': () => {
        showPage('configPage');
        telegramService.hideBackButton();
        //telegramService.setupBackButton();
    }
};