

function setTheme(theme) {
    const root = document.documentElement;
    switch (theme) {
        case 'light':
            root.className = 'light-theme';
            break;
        case 'dark':
            root.className = 'dark-theme';
            break;
        case 'red-dark-theme':
            root.className = 'red-dark-theme';
            break;
        case 'purple-dark-theme':
            root.className = 'purple-dark-theme';
            break;
        case 'green-dark-theme':
            root.className = 'green-dark-theme';
            break;
        case 'blue-dark-theme':
            root.className = 'blue-dark-theme';
            break;
        case 'orange-dark-theme':
            root.className = 'orange-dark-theme';
            break;
        case 'yellow-dark-theme':
            root.className = 'yellow-dark-theme';
            break;
        case 'pink-dark-theme':
            root.className = 'pink-dark-theme';
            break;
        case 'cyan-dark-theme':
            root.className = 'cyan-dark-theme';
            break;
        case 'brown-dark-theme':
            root.className = 'brown-dark-theme';
            break;
        case 'silver-dark-theme':
            root.className = 'silver-dark-theme';
            break;
        case 'lime-dark-theme':
            root.className = 'lime-dark-theme';
            break;
        default:
            root.className = 'light-theme';
    }
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('active');
    });
    document.querySelector(`.theme-option[onclick="setTheme('${theme}')"]`).classList.add('active');
    
    if (typeof window.usernameSelected === 'string') {
        console.log(window.usernameSelected);
        localStorage.setItem(`${window.usernameSelected}-theme`, theme);
    } else if (typeof window.usernameSelected === 'object' && window.usernameSelected !== null) {
        console.log(window.usernameSelected.username);
        localStorage.setItem(`${window.usernameSelected.username}-theme`, theme);
    } else {
        console.error('Il valore di window.usernameSelected non è valido.');
    }    
    applySavedTheme();
    // localStorage.setItem('theme', theme);
}

export function applySavedTheme() {
    
    const savedTheme = localStorage.getItem(`${window.usernameSelected.username}-theme`);
    console.log(`${window.usernameSelected.username}-${savedTheme}`);
    if (savedTheme) {
        document.body.className = savedTheme;
    }
}

window.setTheme = setTheme;