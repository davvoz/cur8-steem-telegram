window.onload = function () {

    const cssClasses = [];
    const themeStylesheet = Array.from(document.styleSheets).find(sheet => sheet.href && sheet.href.includes('themes.css'));
    if (themeStylesheet) {
        try {
            const cssRules = themeStylesheet.cssRules || themeStylesheet.rules;
            Array.from(cssRules).forEach(rule => {
                if (rule.selectorText && rule.selectorText.includes('.theme-selector') && rule.selectorText !== '.theme-selector') {
                    const noPoint = rule.selectorText.replace('.', '');
                    cssClasses.push(noPoint);
                }
            });
        } catch (e) {
            console.warn(`Cannot access stylesheet: ${themeStylesheet.href}`);
        }
    }
    const themeChooser = document.querySelector('.theme-chooser');
    cssClasses.forEach(theme => {
        const themeOption = document.createElement('div');
        themeOption.classList.add('theme-option');
        const themeStyle = Array.from(document.styleSheets).find(sheet => sheet.href && sheet.href.includes('themes.css'));
        const themeRules = themeStyle.cssRules || themeStyle.rules;
        Array.from(themeRules).forEach(rule => {
            if (rule.selectorText && rule.selectorText.includes(`.${theme}`)) {
                const cssVars = rule.style.cssText.split(';').filter(cssVar => cssVar.includes('--'));
                const toSplitBg = cssVars.find(cssVar => cssVar.includes('--background'));
                if (toSplitBg === undefined) {
                    return;
                }
                const background = toSplitBg.split(':')[1].trim();
                const toSplitPrimaryColor = cssVars.find(cssVar => cssVar.includes('--primary-color'));
                if (toSplitPrimaryColor === undefined) {
                    return;
                }
                const primaryColor = toSplitPrimaryColor.split(':')[1].trim();
                themeOption.style.background = `linear-gradient(to right, ${background} 50%, ${primaryColor} 50%)`;
            }
        });
        themeOption.onclick = () => setTheme(`${theme}`);

        themeChooser.appendChild(themeOption);
    });
};

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

