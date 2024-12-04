import { translations } from './translations.js';

class LanguageManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'en';
    }

    setLanguage(lang) {
        if (translations[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('language', lang);
            this.updatePageText();
            return true;
        }
        return false;
    }

    getText(key) {
        return translations[this.currentLanguage]?.[key] || translations.en[key] || key;
    }

    updatePageText() {
        // Update navigation
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (element.placeholder) {
                element.placeholder = this.getText(key);
            } else {
                element.textContent = this.getText(key);
            }
        });

        // Dispatch event for components that need to update
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: this.currentLanguage }
        }));
    }

    getAvailableLanguages() {
        return Object.keys(translations);
    }
}

export const languageManager = new LanguageManager();
