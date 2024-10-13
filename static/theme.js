// function setTheme(theme) {
//     const root = document.documentElement;
//     switch (theme) {
//         case 'light':
//             root.style.setProperty('--primary-color', '#333333');
//             root.style.setProperty('--secondary-color', '#ffffff');
//             root.style.setProperty('--accent-color', '#4CAF50');
//             root.style.setProperty('--text-color', '#333333');
//             root.style.setProperty('--background-color', '#f0f0f0');
//             break;
//         case 'dark':
//             root.style.setProperty('--primary-color', '#f0f0f0');
//             root.style.setProperty('--secondary-color', '#333333');
//             root.style.setProperty('--accent-color', '#4CAF50');
//             root.style.setProperty('--text-color', '#f0f0f0');
//             root.style.setProperty('--background-color', '#1a1a1a');
//             break;
//         case 'blue':
//             root.style.setProperty('--primary-color', '#1565c0');
//             root.style.setProperty('--secondary-color', '#ffffff');
//             root.style.setProperty('--accent-color', '#ffc107');
//             root.style.setProperty('--text-color', '#333333');
//             root.style.setProperty('--background-color', '#e6f3ff');
//             break;
//         case 'pink':
//             root.style.setProperty('--primary-color', '#c2185b');
//             root.style.setProperty('--secondary-color', '#ffffff');
//             root.style.setProperty('--accent-color', '#8bc34a');
//             root.style.setProperty('--text-color', '#333333');
//             root.style.setProperty('--background-color', '#fff0f5');
//             break;
//         case 'mint':
//             root.style.setProperty('--primary-color', '#00796b');
//             root.style.setProperty('--secondary-color', '#ffffff');
//             root.style.setProperty('--accent-color', '#ff5722');
//             root.style.setProperty('--text-color', '#333333');
//             root.style.setProperty('--background-color', '#f0fff0');
//             break;
//         case 'lemon':
//             root.style.setProperty('--primary-color', '#fbc02d');
//             root.style.setProperty('--secondary-color', '#ffffff');
//             root.style.setProperty('--accent-color', '#3f51b5');
//             root.style.setProperty('--text-color', '#333333');
//             root.style.setProperty('--background-color', '#fffacd');
//             break;
//         case 'peach':
//             root.style.setProperty('--primary-color', '#ff7043');
//             root.style.setProperty('--secondary-color', '#ffffff');
//             root.style.setProperty('--accent-color', '#2196f3');
//             root.style.setProperty('--text-color', '#333333');
//             root.style.setProperty('--background-color', '#ffe4b5');
//             break;
//         case 'lavender':
//             root.style.setProperty('--primary-color', '#7e57c2');
//             root.style.setProperty('--secondary-color', '#ffffff');
//             root.style.setProperty('--accent-color', '#26a69a');
//             root.style.setProperty('--text-color', '#333333');
//             root.style.setProperty('--background-color', '#e6e6fa');
//             break;
//         case 'wheat':
//             root.style.setProperty('--primary-color', '#795548');
//             root.style.setProperty('--secondary-color', '#ffffff');
//             root.style.setProperty('--accent-color', '#009688');
//             root.style.setProperty('--text-color', '#333333');
//             root.style.setProperty('--background-color', '#f5deb3');
//             break;
//         case 'sage':
//             root.style.setProperty('--primary-color', '#558b2f');
//             root.style.setProperty('--secondary-color', '#ffffff');
//             root.style.setProperty('--accent-color', '#ff4081');
//             root.style.setProperty('--text-color', '#333333');
//             root.style.setProperty('--background-color', '#d3ffce');
//             break;
//         case 'coral':
//             root.style.setProperty('--primary-color', '#e64a19');
//             root.style.setProperty('--secondary-color', '#ffffff');
//             root.style.setProperty('--accent-color', '#00bcd4');
//             root.style.setProperty('--text-color', '#333333');
//             root.style.setProperty('--background-color', '#ffdab9');
//             break;
//         case 'sky':
//             root.style.setProperty('--primary-color', '#0288d1');
//             root.style.setProperty('--secondary-color', '#ffffff');
//             root.style.setProperty('--accent-color', '#ffd600');
//             root.style.setProperty('--text-color', '#333333');
//             root.style.setProperty('--background-color', '#e0ffff');
//             break;
//         case 'sunset':
//             root.style.setProperty('--primary-color', '#ff4500'); // Arancione scuro
//             root.style.setProperty('--secondary-color', '#ffffff'); // Bianco
//             root.style.setProperty('--accent-color', '#ffd700'); // Oro
//             root.style.setProperty('--text-color', '#000000'); // Nero
//             root.style.setProperty('--background-color', '#ffdead'); // Beige chiaro
//             break;
//         case 'forest':
//             root.style.setProperty('--primary-color', '#228b22'); // Verde foresta
//             root.style.setProperty('--secondary-color', '#ffffff'); // Bianco
//             root.style.setProperty('--accent-color', '#deb887'); // Marrone chiaro
//             root.style.setProperty('--text-color', '#000000'); // Nero
//             root.style.setProperty('--background-color', '#2e8b57'); // Verde scuro
//             break;
//         case 'ocean':
//             root.style.setProperty('--primary-color', '#1e90ff'); // Blu oceano
//             root.style.setProperty('--secondary-color', '#ffffff'); // Bianco
//             root.style.setProperty('--accent-color', '#20b2aa'); // Verde acqua
//             root.style.setProperty('--text-color', '#000000'); // Nero
//             root.style.setProperty('--background-color', '#afeeee'); // Azzurro chiaro
//             break;
//         case 'autumn':
//             root.style.setProperty('--primary-color', '#d2691e'); // Marrone autunnale
//             root.style.setProperty('--secondary-color', '#ffffff'); // Bianco
//             root.style.setProperty('--accent-color', '#ff4500'); // Arancione scuro
//             root.style.setProperty('--text-color', '#000000'); // Nero
//             root.style.setProperty('--background-color', '#f4a460'); // Marrone chiaro
//             break;
//         case 'galaxy':
//             root.style.setProperty('--primary-color', '#4b0082'); // Indaco
//             root.style.setProperty('--secondary-color', '#ffffff'); // Bianco
//             root.style.setProperty('--accent-color', '#dda0dd'); // Viola chiaro
//             root.style.setProperty('--text-color', '#000000'); // Nero
//             root.style.setProperty('--background-color', '#483d8b'); // Blu scuro
//             break;                               
//         default:
//             setTheme('light');
//     }

    // document.querySelectorAll('.theme-option').forEach(option => {
    //     option.classList.remove('active');
    // });
    // document.querySelector(`.theme-option[onclick="setTheme('${theme}')"]`).classList.add('active');
    // localStorage.setItem(`${window.usernameSelected}-theme`, theme);
// }

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