import { languageManager } from '../i18n/languageManager.js';
import { getUserDrafts } from '../pages/draftPage.js';

const languageNames = {
    en: 'English',
    es: 'Español',
    it: 'Italiano',
    fr: 'Français',
    de: 'Deutsch',
    ru: 'Русский',
    uk: 'Українська',
    ja: '日本語',
    zh: '中文',
    hi: 'हिन्दी',
    ar: 'العربية',
    pt: 'Português'
};

const flags = {
    en: '🇬🇧',
    es: '🇪🇸',
    it: '🇮🇹',
    fr: '🇫🇷',
    de: '🇩🇪',
    ru: '🇷🇺',
    uk: '🇺🇦',
    ja: '🇯🇵',
    zh: '🇨🇳',
    hi: '🇮🇳',
    ar: '🇸🇦',
    pt: '🇵🇹'
};

export class LanguageSelector {
    constructor(selectElement) {
        this.selectElement = selectElement;
        this.init();
    }

    init() {
        // Clear existing options
        this.selectElement.innerHTML = '';
        
        // Get available languages
        const languages = languageManager.getAvailableLanguages();
        
        // Create and append options
        languages.forEach(langCode => {
            const option = document.createElement('option');
            option.value = langCode;
            option.textContent = `${flags[langCode]} ${languageNames[langCode]}`;
            this.selectElement.appendChild(option);
        });

        // Set current language
        this.selectElement.value = languageManager.currentLanguage;
        
        // Add change event listener
        this.selectElement.addEventListener('change', (e) => {
            languageManager.setLanguage(e.target.value);
            // Reinitialize draft tabs after language change
            getUserDrafts();
        });
    }
}
