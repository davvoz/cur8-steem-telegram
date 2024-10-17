import ApiClient from './api-client.js';
import { initializeImageUpload, setUsernameForImageUpload } from './image-upload.js';
import { applySavedTheme } from './theme.js';

const eventListeners = [
    { id: 'goLogin', event: 'click', handler: login },
    { id: 'openComunities', event: 'click', handler: openComunitiesAutocomplete },
    { id: 'previewBtn', event: 'click', handler: togglePreview },
    { id: 'openDatePicker', event: 'click', handler: openDatePicker },
    { id: 'postToSteem', event: 'click', handler: postToSteem },
    { id: 'salvaBozza', event: 'click', handler: salvaBozza },
    { id: 'postBtn', event: 'click', handler: () => window.location.hash = '#/post' },
    { id: 'draftBtn', event: 'click', handler: () => window.location.hash = '#/draft' },
    { id: 'accountBtn', event: 'click', handler: () => window.location.hash = '#/' },
    { id: 'loginInBtn', event: 'click', handler: () => window.location.hash = '#/login' },
    { id: 'configBtn', event: 'click', handler: () => window.location.hash = '#/config' }

];

function router() {
    const path = window.location.hash.slice(1) || '/';
    const route = routes[path];
    if (route) {
        route();
        if (path === '/') {
            if (window.Telegram && window.Telegram.WebApp) {
                window.Telegram.WebApp.BackButton.hide();
            }
        } else {
            setupTelegramBackButton();
        }
    } else {
        console.log('404 Not Found');
    }
}

const routes = {
    '/': showAccountPage,
    '/post': showPostPage,
    '/draft': showDraftPage,
    '/login': showLoginPage,
    '/config': showConfigPage
};

eventListeners.forEach(({ id, event, handler }) => {
    document.getElementById(id).addEventListener(event, handler);
});

let listaComunities;
let currentFocus = -1;
let scheduledTime;
let client = new ApiClient();
let usernames = [];
let idTelegram;
window.usernameSelected = '';
initializeImageUpload();

function svuotaForm() {
    document.getElementById('postTitle').value = '';
    document.getElementById('postTags').value = '';
    document.getElementById('postBody').value = '';
    document.getElementById('openDatePicker').innerHTML = '<i class="material-icons">schedule</i>';
    document.getElementById('openDatePicker').classList.add('action-btn-mini');
    document.getElementById('openDatePicker').classList.remove('action-btn');
    ['postTitle', 'postBody', 'postTags'].forEach(id => {
        document.getElementById(id).classList.remove('error');
    });

    document.getElementById('comunityName').innerText = 'Seleziona la comunità';
    scheduledTime = null;
}

function markdownToHtml(markdown) {
    let html = marked.parse(markdown);
    html = DOMPurify.sanitize(html);
    html = html.replace(/<img/g, '<img class="img-fluid"');
    html = html.replace(/<video/g, '<video class="img-fluid"');
    return html;
}

function togglePreview() {
    const postBody = document.getElementById('postBody').value;
    const previewContent = document.getElementById('previewContent');
    previewContent.innerHTML = markdownToHtml(postBody);
    const modal = document.getElementById('previewModal');
    modal.style.display = 'block';
    const closeButton = document.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });
}

async function getListaComunities() {
    try {
        const result = await client.listaComunities();
        displayResult(result, 'success');
        return result;
    } catch (error) {
        console.error('Error in getListaComunities:', error);
        displayResult({ error: error.message }, 'error');
    }
}

function prepareShowPage(fromBozze) {
    if (!fromBozze) {
        svuotaForm();
    }
    showPage('postPage');
}

function prepareShowPageBozze() {
    if (!window.usernameSelected.username) {
        displayResult({ error: 'Seleziona un account' }, 'error', true);
        return;
    }
    svuotaForm();
    showPage('draftPage');
}

function openDatePicker() {
    const dialog = createDatePickerDialog();
    document.body.appendChild(dialog);
    dialog.showModal();
    const confirmButton = dialog.querySelector('#confirmButtonDP');
    const cancelButton = dialog.querySelector('#cancelButtonDP');
    const scheduledTimeInput = dialog.querySelector('#scheduledTime');
    confirmButton.addEventListener('click', () => handleDatePickerConfirm(dialog, scheduledTimeInput));
    cancelButton.addEventListener('click', () => dialog.remove());
    dialog.addEventListener('close', () => dialog.remove());
}

function createDatePickerDialog() {
    const dialog = document.createElement('dialog');
    dialog.classList.add('dialogo');
    dialog.innerHTML = `
        <h2>Seleziona la data e l'ora di pubblicazione</h2>
        <input type="datetime-local" id="scheduledTime" name="scheduledTime">
        <button id="confirmButtonDP" class="action-btn">Conferma</button>
        <button id="cancelButtonDP" class="action-btn">Annulla</button>
    `;
    return dialog;
}

function handleDatePickerConfirm(dialog, scheduledTimeInput) {
    const scheduled = scheduledTimeInput.value;
    scheduledTime = new Date(scheduled).getTime();
    document.getElementById('openDatePicker').innerText = new Date(scheduled).toLocaleString();
    document.getElementById('openDatePicker').classList.add('action-btn');
    document.getElementById('openDatePicker').classList.remove('action-btn-mini');
    dialog.remove();
}

function openComunitiesAutocomplete() {
    const dialog = createDialog();
    document.body.appendChild(dialog);
    dialog.showModal();
    const input = document.getElementById("myInput");
    const confirmButton = document.getElementById('confirmButton');
    const cancelButton = document.getElementById('cancelButton');
    confirmButton.addEventListener('click', () => handleConfirm(dialog, input));
    cancelButton.addEventListener('click', () => dialog.remove());
    dialog.addEventListener('close', () => dialog.remove());
    input.addEventListener("input", handleInput);
    input.addEventListener("keydown", handleKeydown);
}

function createDialog() {
    const dialog = document.createElement('dialog');
    dialog.classList.add('c-dialogo');
    dialog.innerHTML = `
        <div class="autocomplete-container">
            <h2>Seleziona la comunità</h2>
            <div class="c-container">
            <input type="text" id="myInput" placeholder="Inizia a digitare...">
            <div id="autocomplete-list" class="autocomplete-items"></div>
            </div>
            <button id="confirmButton" class="action-btn">Conferma</button>
            <button id="cancelButton" class="action-btn">Annulla</button>
        </div>
    `;
    return dialog;
}

function handleConfirm(dialog, input) {
    const selectedComunity = input.value;
    document.getElementById('comunityName').innerText = selectedComunity;
    dialog.remove();
}

function handleInput(e) {
    const val = this.value;
    closeAllLists(null, this);
    if (!val) return false;
    currentFocus = -1;
    const div = createAutocompleteList(this);
    listaComunities.then((communities) => {
        communities.forEach((community) => {
            if (community.title.toLowerCase().includes(val.toLowerCase())) {
                const item = createAutocompleteItem(community, val);
                item.addEventListener("click", () => handleItemClick(item, community));
                div.appendChild(item);
            }
        });
    });
}

function createAutocompleteList(inputElement) {
    const div = document.createElement("div");
    div.setAttribute("id", inputElement.id + "autocomplete-list");
    div.setAttribute("class", "autocomplete-items");
    inputElement.parentNode.appendChild(div);
    return div;
}

function createAutocompleteItem(community, val) {
    const item = document.createElement("div");
    const matchStart = community.title.toLowerCase().indexOf(val.toLowerCase());
    const matchEnd = matchStart + val.length;
    item.innerHTML = community.title.substr(0, matchStart);
    item.innerHTML += "<strong>" + community.title.substr(matchStart, val.length) + "</strong>";
    item.innerHTML += community.title.substr(matchEnd);
    item.innerHTML += `<input type='hidden' value='${community.title}'>`;
    return item;
}

function handleItemClick(item, community) {
    const input = document.getElementById("myInput");
    input.value = item.getElementsByTagName("input")[0].value;
    document.getElementById('postTags').value = community.name;
    closeAllLists(null, item);
}

function handleKeydown(e) {
    let x = document.getElementById(this.id + "autocomplete-list");
    if (x) x = x.getElementsByTagName("div");
    if (e.keyCode == 40) {
        currentFocus++;
        addActive(x);
    } else if (e.keyCode == 38) {
        currentFocus--;
        addActive(x);
    } else if (e.keyCode == 13) {
        e.preventDefault();
        if (currentFocus > -1 && x) x[currentFocus].click();
    }
}

function addActive(x) {
    if (!x) return false;
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    x[currentFocus].classList.add("autocomplete-active");
}

function removeActive(x) {
    for (let i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
    }
}

function closeAllLists(elmnt, elmnt2) {
    const x = document.getElementsByClassName("autocomplete-items");
    for (let i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt2 != x[i]) {
            x[i].parentNode.removeChild(x[i]);
        }
    }
}

async function salvaBozza() {
    if (!validateForm()) {
        return;
    }
    let scheduledDate = null;
    if (document.getElementById('openDatePicker').innerText && document.getElementById('openDatePicker').innerText !== 'schedule') {
        const dateString = document.getElementById('openDatePicker').innerText;
        if (dateString) {
            const [datePart, timePart] = dateString.split(', ');
            const [day, month, year] = datePart.split('/').map(Number);
            const [hours, minutes, seconds] = timePart.split(':').map(Number);
            scheduledDate = new Date(year, month - 1, day, hours, minutes, seconds).getTime();
            if (scheduledDate < Date.now()) {
                displayResult({ error: 'La data di pubblicazione non può essere nel passato' }, 'error', true);
                document.getElementById('openDatePicker').innerHTML = '<i class="material-icons">schedule</i>';
                document.getElementById('openDatePicker').classList.add('action-btn-mini');
                document.getElementById('openDatePicker').classList.remove('action-btn');
                return;
            }
        }
    }

    try {
        scheduledTime = scheduledDate ? new Date(scheduledDate).toISOString() : '';
        const result = await client.saveDraft(
            getUsername(),
            document.getElementById('postTitle').value,
            document.getElementById('postTags').value,
            document.getElementById('postBody').value,
            scheduledTime,
            Intl.DateTimeFormat().resolvedOptions().timeZone
        );
        await getUserDrafts(); // Ricarica i draft dopo il salvataggio
        displayResult(result, 'success', true);
    } catch (error) {
        console.error('Error in salvaBozza:', error);
        displayResult({ error: error.message }, 'error', true);
    }
}

const initializeTelegram = async () => {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
        return window.Telegram.WebApp.initDataUnsafe.user.id;
    }
    return getDialogTelegramId();
};

const getDialogTelegramId = () => {
    return new Promise((resolve) => {
        const dialog = createDialogo();
        document.body.appendChild(dialog);
        dialog.showModal();

        const confirmButton = dialog.querySelector('#confirmButtonTelegramId');
        confirmButton.addEventListener('click', () => {
            document.getElementById('spinner').classList.remove('hide');
            const telegramId = document.getElementById('telegramId').value;
            closeAndResolve(dialog, telegramId, resolve).then(() => {
                idTelegram = telegramId;
                localStorage.setItem('idTelegram', telegramId);
            });
        });
        dialog.addEventListener('close', () => {
            closeAndResolve(dialog, null, resolve);
        });
    });
};

const createDialogo = () => {
    const dialog = document.createElement('dialog');
    dialog.classList.add('dialogo');
    dialog.innerHTML = `
        <h2>Telegram ID</h2>
        <input type="text" id="telegramId" placeholder="Inserisci il tuo ID Telegram">
        <button id="confirmButtonTelegramId" class="action-btn">Conferma</button>
    `;
    return dialog;
};

const closeAndResolve = async (dialog, value, resolve) => {
    dialog.close();
    dialog.remove();
    await resolve(value);
};

function updateStatus(message) {
    //stampa con le nostre dialog
    displayResult({ info: message }, 'info', true);
}


function handleCallback() {
    console.log('Handling callback');
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const state = urlParams.get('state');
    console.log('Url params:', urlParams);
    if (state) {
        const savedState = sessionStorage.getItem('steemLoginState');
        if (state === savedState) {
            //scrivilo nel local storage
            updateStatus('Login effettuato con successo');
            // Rimuovi i parametri dall'URL
            console.log("HANDLE CALLBACK", getSteemloginUsername(accessToken));
            window.history.replaceState({}, document.title, window.location.pathname);
        } else {
            updateStatus('Errore: Stato non corrispondente');
        }
        sessionStorage.removeItem('steemLoginState');
    }

}

async function getSteemloginUsername(accessToken) {
    if (!accessToken) {
        updateStatus('Utente non loggato. Impossibile ottenere i dati.');
        return;
    }

    try {
        const response = await fetch('https://api.steemlogin.com/api/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Errore nella richiesta API');
        }

        const userData = await response.json();
        console.log('Dati utente:', userData);

        await loginSteemLogin(userData.username);
        displayUserData(userData);
    } catch (error) {
        console.error('Errore durante il recupero dei dati utente:', error);
        updateStatus('Errore durante il recupero dei dati utente: ' + error.message);
    }
}

function displayUserData(userData) {
    const dialog = document.createElement('dialog');
    dialog.classList.add('dialogo');
    dialog.innerHTML = `
        <h2>Dati Utente</h2>
        <ul>
            ${Object.entries(userData).map(([key, value]) => `<li>${key}: ${value}</li>`).join('')}
        </ul>
        <button id="closeButton" class="action-btn">Chiudi</button>
    `;
    document.body.appendChild(dialog);
    dialog.showModal();
    const closeButton = dialog.querySelector('#closeButton');
    closeButton.addEventListener('click', () => {
        dialog.remove();
    });
    dialog.addEventListener('close', () => dialog.remove());
}


function initializeEnd(result) {
    enableNavigationButtons();
    console.log('initializeEnd', result);
    listaComunities = getListaComunities();
    usernames = result.usernames;
    const accountList = document.getElementById('accountList');
    accountList.innerHTML = '';
    usernames.forEach(createAccountListItem);
    if (usernames.length > 0) {
        window.usernameSelected = usernames[0];
        document.getElementById('titleGestionBozze').innerText = `Gestione Bozze di ${window.usernameSelected.username}`;
        setUsernameForImageUpload(window.usernameSelected.username);
        usernameSelected = usernames[0];
        const firstAccountContainer = accountList.querySelector('.container-username');
        if (firstAccountContainer) {
            selectAccount(window.usernameSelected, firstAccountContainer);
        }
    }
    document.getElementById('spinner').classList.add('hide');
    showPage('accountPage');
    displayResult(result);
}

function createAccountListItem(username) {
    const li = document.createElement('li');
    const container = document.createElement('div');
    container.classList.add('container-username');
    const imgNameContainer = document.createElement('div');
    imgNameContainer.style.display = 'flex';
    imgNameContainer.style.flexDirection = 'row';
    imgNameContainer.style.alignItems = 'center';

    const img = document.createElement('img');
    img.alt = `${username.username}'s profile image`;
    img.classList.add('profile-image-thumbnail'); // Add a class for thumbnail styling
    if (username.profile_image) {
        img.src = username.profile_image;
    } else {
        img.src = 'https://fonts.gstatic.com/s/i/materialiconsoutlined/account_circle/v6/24px.svg'; // URL for material icon
    }

    const spanUSername = document.createElement('span');
    spanUSername.innerText = username.username;
    spanUSername.classList.add('usernameElement');

    container.onclick = () => {
        selectAccount(username, container);
        window.usernameSelected = username;
        document.getElementById('titleGestionBozze').innerText = `Gestione Bozze di ${window.usernameSelected.username}`;
    };

    const buttonsContainer = document.createElement('div');
    const logoutButton = document.createElement('button');
    logoutButton.classList.add('action-btn');
    logoutButton.innerText = 'Logout';
    logoutButton.onclick = () => {
        window.usernameSelected = '';
        handleLogout(username.username);
    };

    buttonsContainer.classList.add('buttons-container');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.flexDirection = 'row';
    buttonsContainer.style.flexWrap = 'nowrap';
    buttonsContainer.style.justifyContent = 'flex-end';
    buttonsContainer.style.alignItems = 'baseline';

    buttonsContainer.appendChild(logoutButton);
    imgNameContainer.appendChild(img);
    imgNameContainer.appendChild(spanUSername);
    container.appendChild(imgNameContainer);
    container.appendChild(buttonsContainer);
    li.appendChild(container);
    document.getElementById('accountList').appendChild(li);
}

function selectAccount(username, containerElement) {
    window.usernameSelected = username;
    document.querySelectorAll('.container-username').forEach(el => {
        el.classList.remove('selected');
    });

    containerElement.classList.add('selected');
    displayResult({ message: `Account ${username.username} selected` }, 'success');
    getUserDrafts(); // Carica i draft quando si seleziona un account
    applySavedTheme(); // Carica il tema salvato quando si seleziona un account
    setUsernameForImageUpload(username.username);
}


async function handleLogout(username) {
    const dialog = document.createElement('dialog');
    dialog.classList.add('dialogo');
    dialog.innerHTML = `
        <h2>Conferma Logout</h2>
        <p>Sei sicuro di voler effettuare il logout?</p>
        <button id="confirmButtonLogout" class="action-btn">Conferma</button>
        <button id="cancelButtonLogout" class="action-btn">Annulla</button>
    `;
    document.body.appendChild(dialog);
    dialog.showModal();
    const confirmButton = dialog.querySelector('#confirmButtonLogout');
    const cancelButton = dialog.querySelector('#cancelButtonLogout');
    confirmButton.addEventListener('click', async () => {
        dialog.remove();
        try {
            //attiva lo spinner
            let id = localStorage.getItem('idTelegram');
            const result = await client.logout(id, username).then(() => {
                //ferma lo spinner
            }).finally(async () => {
                await client.checkLogin(id).then(async (result) => {
                    if (typeof result.usernames === 'undefined') {
                        //termina lo spinner
                        displayResult({ error: 'Nessun account trovato' }, 'error', true);
                        return;
                    }
                    usernames = result.usernames;
                    initializeEnd(result);
                }).finally(() => {
                    document.getElementById('spinner').classList.add('hide');
                });
            });
            displayResult(result, 'success');
        } catch (error) {
            document.getElementById('spinner').classList.remove('hide');
            console.error('Error in handleLogout:', error);
            displayResult({ error: error.message }, 'error');
        }
    });
    cancelButton.addEventListener('click', () => {
        dialog.remove();
    });

    dialog.addEventListener('close', () => {
        dialog.remove();
    });
}

function enableNavigationButtons() {
    ['draftBtn', 'postBtn', 'accountBtn', 'configBtn'].forEach(id => {
        document.getElementById(id).disabled = false;
    });
}

function getUsername() {
    if (typeof window.usernameSelected.username === 'undefined') {
        return usernames[0].username;
    }
    return window.usernameSelected.username;
}

function displayResult(result, type = 'success', enabled = false, callback, time = 2000) {
    if (enabled) {
        //crea una dialog con il risultato
        const dialog = document.createElement('dialog');
        dialog.classList.add('dialog');
        switch (type) {
            case 'success':
                dialog.innerHTML = `
                <h2>Risultato</h2>
                <p>${result.message}</p>
                <button id="closeButton" class="action-btn">Chiudi</button>
                `;
                break;
            case 'error':
                dialog.innerHTML = `
                <h2>Errore</h2>
                <p>${result.error}</p>
                <button id="closeButton" class="action-btn">Chiudi</button>
                `;
                break;
            default:
                dialog.innerHTML = `
                <h2>Informazione</h2>
                <p>${result.info}</p>
                <button id="closeButton" class="action-btn">Chiudi</button>
                `;
        }
        document.body.appendChild(dialog);
        dialog.classList.add(type);
        dialog.showModal();
        const closeButton = dialog.querySelector('#closeButton');
        closeButton.addEventListener('click', () => {
            dialog.remove();
            if (callback) {
                callback();
            }
        });

        dialog.addEventListener('close', () => dialog.remove());
        if (type !== 'error' && (!callback || !neverClose)) {
            setTimeout(() => {
                dialog.remove();
            }, time);
        }
    }
}

function showPage(pageId) {
    const modal = document.getElementById('previewModal');
    modal.style.display = 'none';
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    if (pageId !== 'postPage') {
        svuotaForm();
    }
}

async function loginSteemLogin(username, idTelegram) {
    try {
        const result = await client.login(
            idTelegram,
            username
        );
        displayResult(result, 'success', true);
    } catch (error) {
        console.error('Error in login:', error);
        displayResult({ error: error.message }, 'error', true);
    } finally {
        document.getElementById('spinner').classList.remove('hide');
        await client.checkLogin(idTelegram).then(async (result) => {
            if (typeof result.usernames === 'undefined') {
                //termina lo spinner
                document.getElementById('spinner').classList.add('hide');
                displayResult({ error: 'Nessun account trovato' }, 'error', true);
                return;
            }
            usernames = result.usernames;
            initializeEnd(result);
        });
    }
}

async function login() {
    idTelegram = localStorage.getItem('idTelegram');
    alert
    try {
        await client.login(
            idTelegram,
            document.getElementById('username').value,
            document.getElementById('postingKey').value
        );
        await client.checkLogin(idTelegram).then(async (result) => {
            displayResult(result, 'success', true);
            initializeEnd(result);
        });

    } catch (error) {
        console.error('Error in login:', error);
        displayResult({ error: error.message }, 'error', true);
    }
}

async function getUserDrafts() {
    const username = getUsername();
    if (!username) {
        return;
    }
    try {
        const result = await client.getUserDrafts(username);
        await createListaDrafts(result, username);
    } catch (error) {
        displayResult({ error: 'Failed to load drafts. Please try again.' }, 'error', true);
    }
}

// Create list of drafts
async function createListaDrafts(drafts, username) {
    const draftList = document.getElementById('draftList');
    draftList.innerHTML = ''; // Clear existing list
    if (!Array.isArray(drafts) || drafts.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No drafts available';
        draftList.appendChild(li);
        return;
    }
    drafts.sort((a, b) => {
        if (!a.scheduled_time) return 1;
        if (!b.scheduled_time) return -1;
        return new Date(a.scheduled_time) - new Date(b.scheduled_time);
    });
    drafts.forEach(async (draft, index) => {
        const li = await createDraftListItem(index + 1, draft.title || 'Untitled Draft', draft.scheduled_time, draft.tags, draft);
        if (!draft.scheduled_time) {
            li.classList.add('unscheduled-draft');
        }
        draftList.appendChild(li);
    });
}

async function createDraftListItem(id, title, scheduledTime, tags, draft) {
    const li = document.createElement('li');
    li.classList.add('draft-item');
    const titleSpan = createElementWithClass('span', 'draft-title', title);
    const idDiv = createElementWithClass('div', 'draft-id', id);
    const titleContainer = createElementWithClass('div', 'title-container');
    titleContainer.append(idDiv, titleSpan);
    const infoDiv = createElementWithClass('div', 'draft-info');
    infoDiv.style.display = 'flex';
    infoDiv.style.flexDirection = 'column';
    infoDiv.style.marginRight = '10px';
    const scheduledTimeSpan = createElementWithClass('div', 'scheduled-time', scheduledTime ? new Date(scheduledTime).toLocaleString() : 'No scheduled time');
    infoDiv.appendChild(scheduledTimeSpan);
    const titleScheduleContainer = createElementWithClass('div', 'title-schedule-container');
    titleScheduleContainer.append(titleContainer, infoDiv);
    li.appendChild(titleScheduleContainer);
    const communityNameSpan = createElementWithClass('div', 'community-name', await converiIlTagInNomeComunita(tags));
    infoDiv.appendChild(communityNameSpan);
    const buttonsContainer = createElementWithClass('div', 'buttons-container-draft');
    buttonsContainer.append(
        createIconButton('edit', () => {
            loadDraft(draft);
            showPage('postPage');
        }),
        createIconButton('delete', () => deleteDraft(draft.id))
    );
    li.appendChild(buttonsContainer);
    return li;
}

function createElementWithClass(tag, className, textContent = '') {
    const element = document.createElement(tag);
    element.classList.add(className);
    element.textContent = textContent;
    return element;
}

function createIconButton(iconName, onClick) {
    const button = document.createElement('button');
    const icon = document.createElement('i');
    icon.classList.add('material-icons');
    icon.innerText = iconName;
    button.appendChild(icon);
    button.classList.add('action-btn-mini');
    button.onclick = (event) => {
        event.stopPropagation(); // Prevent triggering the parent click event
        onClick();
    };
    return button;
}

// Load draft into the editor
async function loadDraft(draft) {
    document.getElementById('postTitle').value = draft.title || '';
    document.getElementById('postTags').value = draft.tags || '';
    document.getElementById('postBody').value = draft.body || '';
    document.getElementById('comunityName').innerText = await converiIlTagInNomeComunita(draft.tags);
    if (draft.scheduled_time) {
        document.getElementById('openDatePicker').innerText = new Date(draft.scheduled_time).toLocaleString();
        document.getElementById('openDatePicker').classList.add('action-btn');
        document.getElementById('openDatePicker').classList.remove('action-btn-mini');
    } else {
        document.getElementById('openDatePicker').innerHTML = '<i class="material-icons">schedule</i>';
        document.getElementById('openDatePicker').classList.add('action-btn-mini');
        document.getElementById('openDatePicker').classList.remove('action-btn');
    }

    scheduledTime = draft.scheduled_time;
}

async function deleteDraft(id) {
    const draftId = id;
    if (!draftId) return;
    const dialog = document.createElement('dialog');
    dialog.classList.add('dialogo');
    dialog.innerHTML = `
        <h2>Conferma Eliminazione</h2>
        <p>Sei sicuro di voler eliminare questa bozza?</p>
        <button id="confirmButtonDelete" class="action-btn">Conferma</button>
        <button id="cancelButtonDelete" class="action-btn">Annulla</button>
    `;
    document.body.appendChild(dialog);
    dialog.showModal();
    const confirmButton = dialog.querySelector('#confirmButtonDelete');
    const cancelButton = dialog.querySelector('#cancelButtonDelete');
    confirmButton.addEventListener('click', async () => {
        dialog.remove();
        try {
            const result = await client.deleteDraft(draftId, getUsername());
            getUserDrafts();
            displayResult(result, 'success', true);
        } catch (error) {
            console.error('Error in deleteDraft:', error);
            displayResult({ error: error.message }, 'error');
        }
    });
    cancelButton.addEventListener('click', () => {
        dialog.remove();
    });
    dialog.addEventListener('close', () => {
        dialog.remove();
    });
}

async function postToSteem() {
    if (!validateForm()) {
        return;
    }

    const dialog = document.createElement('dialog');
    dialog.classList.add('dialogo');
    dialog.innerHTML = `
        <h2>Conferma Pubblicazione</h2>
        <p>Sei sicuro di voler pubblicare questo post su Steem?</p>
        <button id="confirmButtonPost" class="action-btn">Conferma</button>
        <button id="cancelButtonPost" class="action-btn">Annulla</button>
    `;
    document.body.appendChild(dialog);
    dialog.showModal();
    const confirmButton = dialog.querySelector('#confirmButtonPost');
    const cancelButton = dialog.querySelector('#cancelButtonPost');
    confirmButton.addEventListener('click', async () => {
        dialog.remove();
        try {
            const result = await client.postToSteem(
                getUsername(),
                document.getElementById('postTitle').value,
                document.getElementById('postBody').value,
                document.getElementById('postTags').value,
                scheduledTime,
            );
            displayResult(result, 'success', true);
        } catch (error) {
            console.error('Error in postToSteem:', error);
            displayResult({ error: error.message }, 'error', true);
        }
    });
    cancelButton.addEventListener('click', () => {
        dialog.remove();
    });
    dialog.addEventListener('close', () => {
        dialog.remove();
    });
}

function validateForm() {
    const title = document.getElementById('postTitle').value.trim();
    const body = document.getElementById('postBody').value.trim();
    const tags = document.getElementById('postTags').value.trim();
    let isValid = true;
    let errorMessage = '';
    if (title === '') {
        isValid = false;
        errorMessage += 'Il titolo del post è obbligatorio.\n';
    }
    if (body === '') {
        isValid = false;
        errorMessage += 'Il corpo del post è obbligatorio.\n';
    }
    if (tags === '') {
        isValid = false;
        errorMessage += 'Almeno un tag è obbligatorio.\n';
    }
    if (!isValid) {
        displayResult({ error: errorMessage }, 'error', true, false, 5000);
    }
    return isValid;
}

async function converiIlTagInNomeComunita(tags) {
    if (!tags) return 'Select a community';
    const tag = tags.split(' ')[0];
    try {
        const communities = await listaComunities;
        const community = communities.find(community => community.name === tag);
        return community ? community.title : 'Select a community';
    } catch (error) {
        console.error('Error while searching for community:', error);
        return 'Error occurred while searching for community';
    }
}

function showAccountPage() {
    showPage('accountPage');
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.BackButton.hide();
    }
}

function showPostPage() {
    showPage('postPage');
    setupTelegramBackButton();
}

function showDraftPage() {
    showPage('draftPage');
    setupTelegramBackButton();
}

function showLoginPage() {
    showPage('loginPage');
    setupTelegramBackButton();
}

function showConfigPage() {
    showPage('configPage');
    setupTelegramBackButton();
}

function setupTelegramBackButton() {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.BackButton.show();
        window.Telegram.WebApp.BackButton.onClick(() => {
            console.log('Back button clicked' + window.location.hash, window.location, window.history);
            window.history.back();
        });
    }
}


// Add input event listeners to remove error class when user starts typing
['postTitle', 'postBody', 'postTags'].forEach(id => {
    document.getElementById(id).addEventListener('input', function () {
        this.classList.remove('error');
    });
});

window.addEventListener('hashchange', router);
document.addEventListener('DOMContentLoaded', async () => {
    router();
    //controlla se abbiamo un access_token
    const accessTokenPresente = window.location.search.includes('access_token');
    console.log('accessTokenPresente:', accessTokenPresente);

    if (accessTokenPresente) {
        const token = window.location.search.split('access_token=')[1];
        console.log('Token:', token);

        //dobbiamo eliminare dall 'username la parte successiva &expires_in=604800&state=okxlnj"
        const username = window.location.search.split('username=')[1].split('&expires_in=')[0];

        console.log('Username:', username);
        const idTgr = localStorage.getItem('idTelegram');
        await loginSteemLogin(username, idTgr);
        window.history.replaceState({}, document.title, window.location.pathname);
    } else {
        initializeTelegram().then(async idTelegram => {
            console.log('initializeTelegram resolved with idTelegram:', idTelegram);
            localStorage.setItem('idTelegram', idTelegram);
            if (idTelegram) {
                client = new ApiClient();
                try {
                    //attiva lo spinner
                    document.getElementById('spinner').classList.remove('hide');
                    const result = await client.checkLogin(idTelegram);
                    if (typeof result.usernames === 'undefined') {
                        //termina lo spinner
                        document.getElementById('spinner').classList.add('hide');
                        displayResult({ error: 'Nessun account trovato' }, 'error', true);
                        return;
                    }
                    usernames = result.usernames;
                    enableNavigationButtons();
                    initializeEnd(result);
                } catch (error) {
                    showPage('loginPage');
                    displayResult({ error: 'Effettua il login' }, 'error', true);
                    console.error('Error in initialize app:', error);
                    document.getElementById('spinner').classList.add('hide');
                }
            } else {
                displayResult({ error: 'Impossibile ottenere l\'ID Telegram' }, 'error', true, () => {
                    location.reload();
                });
            }
        }).catch(error => {
            console.error('Errore durante l\'inizializzazione di Telegram:', error);
            displayResult({ error: 'Errore durante l\'inizializzazione di Telegram' }, 'error', true, () => {
                location.reload();
            });
        });
    }


});

//steemlogin
document.getElementById('steemlogin').addEventListener('click', goToSteemLogin);

function goToSteemLogin() {
    handleCallback();
    //initializeSteemLogin()
    const steemClient = new window.steemlogin.Client({
        app: 'cur8',
        callbackURL: window.location.origin + window.location.pathname,
        scope: ['login', 'vote', 'comment', 'custom_json'],
    });

    try {
        const state = Math.random().toString(36).substring(7);
        const loginUrl = steemClient.getLoginURL(state);
        sessionStorage.setItem('steemLoginState', state);
        console.log('Login URL:', steemClient);
        window.location.href = loginUrl;
    } catch (error) {
        console.error('Errore durante il processo di login:', error);
        updateStatus('Errore durante il processo di login: ' + error.message);
    }
}

