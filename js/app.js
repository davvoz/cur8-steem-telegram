import { initializeImageUpload } from './api/image-upload.js';
import { handleSteemLogin } from './pages/loginPage.js';
import { appState } from './core/AppState.js';
import appInitializerInstance from './core/AppInitializer.js';
import { EventManager } from './core/EventManager.js';

class App {
    constructor() {
        this.eventManager = new EventManager();
    }

    async initialize() {
        // Initialize base components

        appState.router.handleRoute();
        this.eventManager.initializeEventListeners();
        initializeImageUpload();

        // Handle authentication and initialization
        await handleSteemLogin();
        if (!window.location.search.includes('access_token')) {
            await appInitializerInstance.initializeApp();
        }

        // Initialize input validation
        this.eventManager.initializeInputValidation();

        // Set up event listeners
        window.addEventListener('hashchange', () => appState.router.handleRoute());
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const app = new App();
    await app.initialize();
});