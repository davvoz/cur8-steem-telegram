import { translations } from './translations.js';

let currentLanguage = 'en'; // default language

export function setLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
    }
}

export function t(key, params = {}) {
    try {
        let text = translations[currentLanguage][key] || translations['en'][key] || key;
        
        // Replace any parameters in the translation string
        Object.keys(params).forEach(param => {
            text = text.replace(`{${param}}`, params[param]);
        });
        
        return text;
    } catch (error) {
        console.warn(`Translation key "${key}" not found`);
        return key;
    }
}
