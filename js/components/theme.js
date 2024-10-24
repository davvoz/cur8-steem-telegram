window.onload = function () {
    const cssClasses = getCssClassesFromStylesheet('themes.css', '.theme-selector');
    const themeChooser = document.querySelector('.theme-chooser');
    cssClasses.forEach(theme => {
        const themeOption = createThemeOption(theme, 'themes.css');
        themeOption.onclick = () => setTheme(theme);
        themeChooser.appendChild(themeOption);
    });
};

function getCssClassesFromStylesheet(stylesheetName, selector) {
    const cssClasses = [];
    const themeStylesheet = Array.from(document.styleSheets).find(sheet => sheet.href && sheet.href.includes(stylesheetName));
    if (themeStylesheet) {
        try {
            const cssRules = themeStylesheet.cssRules || themeStylesheet.rules;
            Array.from(cssRules).forEach(rule => {
                if (rule.selectorText && rule.selectorText.includes(selector) && rule.selectorText !== selector) {
                    const noPoint = rule.selectorText.replace('.', '');
                    cssClasses.push(noPoint);
                }
            });
        } catch (e) {
            console.warn(`Cannot access stylesheet: ${themeStylesheet.href}`);
        }
    }
    return cssClasses;
}

function createThemeOption(theme, stylesheetName) {
    const themeOption = document.createElement('div');
    themeOption.classList.add('theme-option');
    const themeStyle = Array.from(document.styleSheets).find(sheet => sheet.href && sheet.href.includes(stylesheetName));
    const themeRules = themeStyle.cssRules || themeStyle.rules;
    Array.from(themeRules).forEach(rule => {
        if (rule.selectorText && rule.selectorText.includes(`.${theme}`)) {
            const cssVars = rule.style.cssText.split(';').filter(cssVar => cssVar.includes('--'));
            const background = getCssVariableValue(cssVars, '--background');
            const primaryColor = getCssVariableValue(cssVars, '--primary-color');
            if (background && primaryColor) {
                themeOption.style.background = `linear-gradient(to right, ${background} 50%, ${primaryColor} 50%)`;
            }
        }
    });
    return themeOption;
}

function getCssVariableValue(cssVars, variableName) {
    const cssVar = cssVars.find(cssVar => cssVar.includes(variableName));
    return cssVar ? cssVar.split(':')[1].trim() : null;
}

function setTheme(theme) {
    if (typeof window.usernameSelected === 'string') {
        localStorage.setItem(`${window.usernameSelected}-theme`, theme);
    } else if (typeof window.usernameSelected === 'object' && window.usernameSelected !== null) {
        localStorage.setItem(`${window.usernameSelected.username}-theme`, theme);
    } else {
        console.error('Il valore di window.usernameSelected non è valido.');
    }
    localStorage.setItem('theme', theme);
    window.localStorage.setItem('theme', theme);
    document.body.className = theme;
}

export function applySavedTheme() {
    const savedTheme = localStorage.getItem(`${window.usernameSelected.username}-theme`);
    console.log(`${window.usernameSelected.username}-${savedTheme}`);
    if (savedTheme) {
        document.body.className = savedTheme;
    }
}

