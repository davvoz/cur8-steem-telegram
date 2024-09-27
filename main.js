import ApiClient from './api-client.js';
import { initializeImageUpload, setUsernameForImageUpload } from './image-upload.js';

const eventListeners = [
    { id: 'postBtn', event: 'click', handler: prepareShowPage },
    { id: 'draftBtn', event: 'click', handler: prepareShowPageBozze },
    { id: 'accountBtn', event: 'click', handler: () => showPage('accountPage') },
    { id: 'goLogin', event: 'click', handler: login },
    { id: 'openComunities', event: 'click', handler: openComunitiesAutocomplete },
    { id: 'previewBtn', event: 'click', handler: togglePreview },
    { id: 'openDatePicker', event: 'click', handler: openDatePicker },
    { id: 'postToSteem', event: 'click', handler: postToSteem },
    { id: 'salvaBozza', event: 'click', handler: salvaBozza },
    { id: 'loginInBtn', event: 'click', handler: () => showPage('loginPage') },
    { id: 'configBtn', event: 'click', handler: () => showPage('configPage') },
];

eventListeners.forEach(({ id, event, handler }) => {
    document.getElementById(id).addEventListener(event, handler);
});

let listaComunities;
let currentFocus = -1;
let scheduledTime;
let client = new ApiClient();
let usernames = [];
let idTelegram;
let usernameSelected = '';
initializeImageUpload();

function svuotaForm() {
    document.getElementById('postTitle').value = '';
    document.getElementById('postTags').value = '';
    document.getElementById('postBody').value = '';
    document.getElementById('scheduledTimeDisplay').innerText = '';
    document.getElementById('selectedAccountDisplay').innerText = '';
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
    document.getElementById('selectedAccountDisplay').innerText = usernameSelected.username;
    if (!fromBozze) {
        svuotaForm();
    }
    showPage('postPage');
}

function prepareShowPageBozze() {
    if (!usernameSelected.username) {
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
    document.getElementById('scheduledTimeDisplay').innerText = new Date(scheduled).toLocaleString();
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
    const dateString = document.getElementById('scheduledTimeDisplay').innerText;
    if (dateString) {
        const [datePart, timePart] = dateString.split(', ');
        const [day, month, year] = datePart.split('/').map(Number);
        const [hours, minutes, seconds] = timePart.split(':').map(Number);
        scheduledDate = new Date(year, month - 1, day, hours, minutes, seconds).getTime();
        if (scheduledDate < Date.now()) {
            displayResult({ error: 'La data di pubblicazione non può essere nel passato' }, 'error', true);
            document.getElementById('scheduledTimeDisplay').innerText = '';
            return;
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
    return await getDialogTelegramId();
};

const getDialogTelegramId = () => {
    return new Promise((resolve) => {
        const dialog = createDialogo();
        document.body.appendChild(dialog);
        dialog.showModal();

        const confirmButton = dialog.querySelector('#confirmButtonTelegramId');
        confirmButton.addEventListener('click', () => {
            //attiva lo spinner
            document.getElementById('spinner').classList.remove('hide');
            const telegramId = document.getElementById('telegramId').value;
            closeAndResolve(dialog, telegramId, resolve).then(() => {
                //nascondi lo spinner
                // document.getElementById('spinner').classList.add('hide');
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

async function initializeApp(userId, fromOut) {
    client = new ApiClient();
    try {
        const result = await client.checkLogin(userId);
        if (fromOut && typeof result.usernames === 'undefined') {
            displayResult({ error: 'Nessun account trovato' }, 'error', true);
            return;
        }
        usernames = result.usernames;
        enableNavigationButtons();
        initializeEnd(result);
    } catch (error) {
        //apriamo il login usando l iD telegram che è stato passato
        showPage('loginPage');
        displayResult({ error: 'Effettua il login' }, 'error', true);
        console.error('Error in initialize app:', error);
        //chiudi lo spinner
        document.getElementById('spinner').classList.add('hide');
    }
}

function initializeEnd(result) {
    listaComunities = getListaComunities();
    usernames = result.usernames;
    const accountList = document.getElementById('accountList');
    accountList.innerHTML = '';
    usernames.forEach(createAccountListItem);
    if (usernames.length > 0) {
        usernameSelected = usernames[0];
        document.getElementById('titleGestionBozze').innerText = `Gestione Bozze di ${usernameSelected.username}`;
       
       setUsernameForImageUpload(usernameSelected.username);

        const firstAccountContainer = accountList.querySelector('.container-username');
        if (firstAccountContainer) {
            selectAccount(usernameSelected, firstAccountContainer);
        }
    }
    // chiudi lo spinner
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
    // Check if profile image exists, otherwise use material icon
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
        usernameSelected = username;
        document.getElementById('titleGestionBozze').innerText = `Gestione Bozze di ${usernameSelected.username}`;
    };

    const buttonsContainer = document.createElement('div');
    const logoutButton = document.createElement('button');
    logoutButton.classList.add('action-btn');
    logoutButton.innerText = 'Logout';
    logoutButton.onclick = () => {
        usernameSelected = '';
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
    // Select the first account by default

}

function selectAccount(username, containerElement) {
    usernameSelected = username;
    document.querySelectorAll('.container-username').forEach(el => {
        el.classList.remove('selected');
    });

    containerElement.classList.add('selected');
    displayResult({ message: `Account ${username.username} selected` }, 'success');
    updateUIWithSelectedAccount();
    getUserDrafts(); // Carica i draft quando si seleziona un account
}

function updateUIWithSelectedAccount() {
    const selectedAccountDisplay = document.getElementById('selectedAccountDisplay');
    if (selectedAccountDisplay) {
        selectedAccountDisplay.textContent = usernameSelected.username ? `Selected Account: ${usernameSelected.username}` : 'No account selected';
    }
    const accountDependentButtons = document.querySelectorAll('.account-dependent');
    accountDependentButtons.forEach(button => {
        button.disabled = !usernameSelected.username;
    });
}

async function handleLogout(username) {
    try {
        //attiva lo spinner
        document.getElementById('spinner').classList.remove('hide');
        const result = await client.logout(idTelegram, username);
        displayResult(result, 'success');
        initializeApp(idTelegram);
    } catch (error) {
        console.error('Error in handleLogout:', error);
        displayResult({ error: error.message }, 'error');
    }
}

function enableNavigationButtons() {
    ['draftBtn', 'postBtn', 'accountBtn', 'configBtn'].forEach(id => {
        document.getElementById(id).disabled = false;
    });
}

function getUsername() {
    if (typeof usernameSelected.username === 'undefined') {
        return usernames[0].username;
    }
    return usernameSelected.username;
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
        //aggiungiamo la classe css che è il type
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

        if (!callback || !neverClose) {
            setTimeout(() => {
                dialog.remove();
            }, time);
        }
    }
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

async function login() {
    try {
        const result = await client.login(
            idTelegram,
            document.getElementById('username').value,
            document.getElementById('postingKey').value
        );
        displayResult(result, 'success', true);
        initializeApp(idTelegram);
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

// Create list of draftsaction-btn-mini
async function createListaDrafts(drafts, username) {
    const draftList = document.getElementById('draftList');
    draftList.innerHTML = ''; // Clear existing list
    if (!Array.isArray(drafts) || drafts.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No drafts available';
        draftList.appendChild(li);
        return;
    }
    drafts.forEach(async (draft, index) => {
        const li = await createDraftListItem(index + 1, draft.title || 'Untitled Draft', draft.scheduled_time, draft.tags);
        const buttonsContainer = document.createElement('div');
        buttonsContainer.classList.add('buttons-container-draft');
        const editButton = createIconButton('edit', () => {
            loadDraft(draft);
            prepareShowPage(true);
        });
        const deleteButton = createIconButton('delete', () => deleteDraft(draft.id));
        buttonsContainer.appendChild(editButton);
        buttonsContainer.appendChild(deleteButton);
        li.appendChild(buttonsContainer);
        draftList.appendChild(li);
    });
}

async function createDraftListItem(id, title, scheduledTime, tags) {
    const li = document.createElement('li');
    li.classList.add('draft-item');
    const titleSpan = document.createElement('span');
    titleSpan.innerText = title;
    titleSpan.classList.add('draft-title');
    const idDiv = document.createElement('div');
    idDiv.classList.add('draft-id');
    const titleContainer = document.createElement('div');
    idDiv.innerText = id;
    titleContainer.classList.add('title-container');
    titleContainer.appendChild(idDiv);
    titleContainer.appendChild(titleSpan);
    li.appendChild(titleContainer);
    const infoDiv = document.createElement('div');
    infoDiv.classList.add('draft-info');
    infoDiv.style.display = 'flex';
    infoDiv.style.flexDirection = 'column';
    infoDiv.style.marginRight = '10px';
    const scheduledTimeSpan = document.createElement('div');
    if (scheduledTime) {
        scheduledTimeSpan.innerText = new Date(scheduledTime).toLocaleString();
    } else {
        scheduledTimeSpan.innerText = 'No scheduled time';
    }
    scheduledTimeSpan.classList.add('scheduled-time');
    infoDiv.appendChild(scheduledTimeSpan);
    const communityNameSpan = document.createElement('div');
    const comunita = await converiIlTagInNomeComunita(tags);
    communityNameSpan.innerText = comunita;
    communityNameSpan.classList.add('community-name');
    infoDiv.appendChild(communityNameSpan);
    li.appendChild(infoDiv);
    return li;
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
    document.getElementById('scheduledTimeDisplay').innerText = draft.scheduled_time ? new Date(draft.scheduled_time).toLocaleString() : '';
    document.getElementById('comunityName').innerText = await converiIlTagInNomeComunita(draft.tags);
    scheduledTime = draft.scheduled_time;
}

async function deleteDraft(id) {
    const draftId = id;
    if (!draftId) return;
    try {
        const result = await client.deleteDraft(draftId, getUsername());
        getUserDrafts();
        displayResult(result, 'success', true);
    } catch (error) {
        console.error('Error in deleteDraft:', error);
        displayResult({ error: error.message }, 'error');
    }
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

async function converiIlTagInNomeComunita(tags) {
    if (!tags) return 'Community not selected';
    const tag = tags.split(' ')[0];
    try {
        const communities = await listaComunities;
        const community = communities.find(community => community.name === tag);
        return community ? community.title : 'Community not selected';
    } catch (error) {
        console.error('Error while searching for community:', error);
        return 'Error occurred while searching for community';
    }
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

// Add input event listeners to remove error class when user starts typing
['postTitle', 'postBody', 'postTags'].forEach(id => {
    document.getElementById(id).addEventListener('input', function () {
        this.classList.remove('error');
    });
});

document.addEventListener('DOMContentLoaded', () => {


    initializeTelegram()
        .then(idTelegramo => {
            console.log('initializeTelegram resolved with idTelegram:', idTelegramo);
            idTelegram = idTelegramo;
            if (idTelegram) {
                initializeApp(idTelegram, true);
            } else {
                displayResult({ error: 'Impossibile ottenere l\'ID Telegram' }, 'error', true, () => {
                    location.reload();
                });
            }
        })
        .catch(error => {
            console.error('Errore durante l\'inizializzazione di Telegram:', error);
            displayResult({ error: 'Errore durante l\'inizializzazione di Telegram' }, 'error', true, () => {
                location.reload();
            });
        });
});
