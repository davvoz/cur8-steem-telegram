import { postToSteem, salvaBozza, openComunitiesAutocomplete, openDatePicker, togglePreview,cancellaBozza } from '../pages/postPage.js';
import { goToSteemLogin, login } from '../pages/loginPage.js';
import { showPage } from '../services/pageService.js';

export class EventManager {
    constructor() {
        this.eventListeners = [
            { id: 'goLogin', event: 'click', handler: login },
            { id: 'openComunities', event: 'click', handler: openComunitiesAutocomplete },
            { id: 'previewBtn', event: 'click', handler: togglePreview },
            { id: 'openDatePicker', event: 'click', handler: openDatePicker },
            { id: 'postToSteem', event: 'click', handler: postToSteem },
            { id: 'salvaBozza', event: 'click', handler: salvaBozza },
            { id: 'postBtn', event: 'click', handler: () => window.location.hash = '#/post' },
            { id: 'draftBtn', event: 'click', handler: () => window.location.hash = '#/draft' },
            { id: 'accountBtn', event: 'click', handler: () => window.location.hash = '#/' },
            { id: 'loginInBtn', event: 'click', handler: () => this.goLogin() },
            { id: 'configBtn', event: 'click', handler: () => window.location.hash = '#/config' },
            { id: 'steemlogin', event: 'click', handler: goToSteemLogin },
            { id: 'cancellaBozza', event: 'click', handler: () => { cancellaBozza() } },
        ];
    }

    goLogin() {
        //TODO:smartellata , da sistemare
        window.location.hash = '#/login';
        showPage('loginPage');
    }

    initializeEventListeners() {
        this.eventListeners.forEach(({ id, event, handler }) => {
            const element = document.getElementById(id);
            if (element) {
                console.log('Adding event listener:', id, event);
                element.addEventListener(event, handler);
            }
        });
    }

    initializeInputValidation() {
        ['postTitle', 'postBody', 'postTags'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', function () {
                    this.classList.remove('error');
                });
            }
        });
    }
}
