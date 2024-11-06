import { languageManager } from '../i18n/languageManager.js';

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
            option.textContent = `${languageNames[langCode]} (${langCode})`;
            this.selectElement.appendChild(option);
        });

        // Set current language
        this.selectElement.value = languageManager.currentLanguage;
        
        // Add change event listener
        this.selectElement.addEventListener('change', (e) => {
            languageManager.setLanguage(e.target.value);
        });
    }
}
