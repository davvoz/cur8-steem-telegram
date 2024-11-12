import { initializeImageUpload } from './api/image-upload.js';
import { handleSteemLogin } from './pages/loginPage.js';
import { appState } from './core/AppState.js';
import appInitializerInstance from './core/AppInitializer.js';
import { EventManager } from './core/EventManager.js';
import { languageManager } from './i18n/languageManager.js';
import { LanguageSelector } from './components/languageSelector.js';

class App {
    constructor() {
        this.eventManager = new EventManager();
    }

    async initialize() {
        let url_string = window.location.href
        let questionMarkCount = 0;
        let modified_url = url_string.replace(/\?/g, function(match) {
            questionMarkCount++;
            return questionMarkCount === 2 ? '&' : match;
        });
        const url = new URL(modified_url);
        const params = new URLSearchParams(url.search);
        const platform = params.get('platform'); // Estrai il valore di 'access_token' 
        const accessToken = params.get('access_token');
        const username = params.get('username');
        localStorage.setItem('platform', platform);
        // if(startParam === null) {
        //     localStorage.setItem('platform', localStorage.getItem('justPlatform'));
        // } else {
        //     localStorage.setItem('platform', startParam);
        // }        
        if (!localStorage.getItem('pageReloaded')) {
            localStorage.setItem('pageReloaded', 'true'); 
            if (accessToken){
                console.log(`${url}: pre`)
                window.location.reload()
                //window.location.reload().then(()=>{console.log('CIAO DIO PORCO')})
                console.log(`${url}: dopo`)
                //window.location.search = `platform=${platform}`
            }
            else{
                window.location.search = `platform=${platform}`;
            }
            //window.location.reload(); 
            return; // Stop further execution until the page reloads 
            } // Clear the reload flag 
            
        localStorage.removeItem('pageReloaded');

        appState.router.handleRoute();
        this.eventManager.initializeEventListeners();
        initializeImageUpload();

        await handleSteemLogin(accessToken, username);
        if (!accessToken || accessToken === 'null') {
             await appInitializerInstance.initializeApp(); 
        }
        else { 
            console.error('Token non presente o nullo'); 
        }

        this.eventManager.initializeInputValidation();

        window.addEventListener('hashchange', () => appState.router.handleRoute());
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    addTranslationAttributes();
    initializeLanguage();

    const app = new App();
    await app.initialize().then(() => {
        
        console.log('App initialized');
    });
});

function initializeLanguage() {
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        new LanguageSelector(languageSelect);
    }
    
    // Initial page translation
    languageManager.updatePageText();
}

// Add data-i18n attributes to elements
function addTranslationAttributes() {
    // Navigation
    document.querySelector('#draftBtn span').setAttribute('data-i18n', 'nav_drafts');
    document.querySelector('#postBtn span').setAttribute('data-i18n', 'nav_publish');
    document.querySelector('#accountBtn span').setAttribute('data-i18n', 'nav_account');
    document.querySelector('#configBtn span').setAttribute('data-i18n', 'nav_settings');

    // Input placeholders
    document.getElementById('postTitle').setAttribute('data-i18n', 'post_title_placeholder');
    document.getElementById('postBody').setAttribute('data-i18n', 'post_body_placeholder');
    document.getElementById('postTags').setAttribute('data-i18n', 'post_tags_placeholder');
    
    // Buttons
    document.getElementById('postToSteem').setAttribute('data-i18n', 'post_publish_now');
    document.getElementById('salvaBozza').setAttribute('data-i18n', 'post_save_draft');
}