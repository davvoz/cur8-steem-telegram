import ApiClient from './api-client.js';
import { initializeImageUpload, setUsernameForImageUpload } from './image-upload.js';

document.getElementById('postBtn').addEventListener('click', () => prepareShowPage());
document.getElementById('draftBtn').addEventListener('click', () => prepareShowPageBozze());
document.getElementById('accountBtn').addEventListener('click', () => showPage('accountPage'));
document.getElementById('goLogin').addEventListener('click', () => login());
document.getElementById('openComunities').addEventListener('click', () => openComunitiesAutocomplete());
document.getElementById('previewBtn').addEventListener('click', () => togglePreview());
document.getElementById('openDatePicker').addEventListener('click', () => openDatePicker());
document.getElementById('postToSteem').addEventListener('click', () => postToSteem());
document.getElementById('salvaBozza').addEventListener('click', () => salvaBozza());
document.getElementById('loginInBtn').addEventListener('click', () => showPage('loginPage'));



let comunityTitle = document.getElementById('comunityName');
let listaComunities;
let currentFocus = -1;
let scheduledTime;
let client = new ApiClient();
let usernames = [];
let idTelegram;
let usernameSelected = '';
initializeImageUpload();

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

function svuotaForm() {
    document.getElementById('postTitle').value = '';
    document.getElementById('postTags').value = '';
    document.getElementById('postBody').value = '';
    document.getElementById('scheduledTimeDisplay').innerText = '';
    document.getElementById('selectedAccountDisplay').innerText = '';
}

function markdownToHtml(markdown) {
    let html = marked.parse(markdown);
    // Sanitize the HTML to prevent XSS attacks
    html = DOMPurify.sanitize(html);
    //le immagini devono avere la classe img-fluid
    html = html.replace(/<img/g, '<img class="img-fluid"');
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
        displayResult({ error: error.message }, 'error');
    }
}


function prepareShowPage() {
    //scelto l'account, mostro la pagina del post con il dato dell 'username'
    document.getElementById('selectedAccountDisplay').innerText = usernameSelected;
    document.getElementById('scheduledTimeDisplay').innerText = scheduledTime ? new Date(scheduledTime).toLocaleString() : '';
    showPage('postPage');
}

function prepareShowPageBozze() {
    //scelto l'account, pulisco il formdei post e mostro la pagina delle bozze
    svuotaForm();
    showPage('draftPage');
}

function openDatePicker() {
    const dialog = createDatePickerDialog();
    document.body.appendChild(dialog);
    dialog.showModal();

    const confirmButton = dialog.querySelector('#confirmButton');
    const cancelButton = dialog.querySelector('#cancelButton');
    const scheduledTimeInput = dialog.querySelector('#scheduledTime');

    confirmButton.addEventListener('click', () => handleDatePickerConfirm(dialog, scheduledTimeInput));
    cancelButton.addEventListener('click', () => dialog.remove());
    dialog.addEventListener('close', () => dialog.remove());
}

function createDatePickerDialog() {
    const dialog = document.createElement('dialog');
    dialog.classList.add('dialog');
    dialog.innerHTML = `
        <h2>Seleziona la data e l'ora di pubblicazione</h2>
        <input type="datetime-local" id="scheduledTime" name="scheduledTime">
        <button id="confirmButton" class="action-btn">Conferma</button>
        <button id="cancelButton" class="action-btn">Annulla</button>
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
    dialog.classList.add('dialog');
    dialog.innerHTML = `
        <div class="autocomplete-container">
            <h2>Seleziona la comunità</h2>
            <input type="text" id="myInput" placeholder="Inizia a digitare...">
            <div id="autocomplete-list" class="autocomplete-items"></div>
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
    comunityTitle = community.title;
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

function closeAllLists(elmnt, elmnt2) {
    const x = document.getElementsByClassName("autocomplete-items");
    for (let i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt2 != x[i]) {
            x[i].parentNode.removeChild(x[i]);
        }
    }
}

function salvaBozza() {
    saveDraft();
    //refresh lista bozze
    getUserDrafts();
}

function initializeTelegram() {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
        return window.Telegram.WebApp.initDataUnsafe.user.id;
    }
    console.warn('Telegram WebApp not available, using default ID');
    alert('Telegram WebApp not available, using default ID');
    return '6999103418';
}

async function initializeApp(userId) {
    client = new ApiClient();
    try {
        const result = await client.checkLogin(userId);
        enableNavigationButtons();
        initializeEnd(result);
    } catch (error) {
        displayResult({ error: error.message }, 'error');
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
        document.getElementById('titleGestionBozze').innerText = `Gestione Bozze di ${usernameSelected}`;
        setUsernameForImageUpload(usernameSelected);
        //evidenziamo nella lista l'account selezionato
        document.querySelectorAll('.container-username').forEach(el => {
            if (el.querySelector('.usernameElement').innerText === usernameSelected) {
                el.classList.add('selected');
            }
        });
        getUserDrafts();
    }
    showPage('accountPage');
    displayResult(result);
}

function createAccountListItem(username) {
    const li = document.createElement('li');
    const container = document.createElement('div');
    container.classList.add('container-username');
    const span = document.createElement('span');
    span.innerText = username;
    span.classList.add('usernameElement');
    container.onclick = () => {
        selectAccount(username, container);
        usernameSelected = username;
        document.getElementById('titleGestionBozze').innerText = `Gestione Bozze di ${usernameSelected}`;
    };
    const buttonsContainer = document.createElement('div');
    const logoutButton = document.createElement('button');
    logoutButton.classList.add('action-btn');
    logoutButton.innerText = 'Logout';
    logoutButton.onclick = (event) => {
        usernameSelected = '';
        handleLogout(username);
    };
    buttonsContainer.classList.add('buttons-container');
    buttonsContainer.appendChild(logoutButton);
    container.appendChild(span);
    container.appendChild(buttonsContainer);
    li.appendChild(container);
    document.getElementById('accountList').appendChild(li);

}

function selectAccount(username, containerElement) {
    usernameSelected = username;
    document.querySelectorAll('.container-username').forEach(el => {
        el.classList.remove('selected');
    });

    containerElement.classList.add('selected');

    displayResult({ message: `Account ${username} selected` }, 'success');
    updateUIWithSelectedAccount();
    getUserDrafts();
}

function updateUIWithSelectedAccount() {
    const selectedAccountDisplay = document.getElementById('selectedAccountDisplay');
    if (selectedAccountDisplay) {
        selectedAccountDisplay.textContent = usernameSelected ? `Selected Account: ${usernameSelected}` : 'No account selected';
    }

    const accountDependentButtons = document.querySelectorAll('.account-dependent');
    accountDependentButtons.forEach(button => {
        button.disabled = !usernameSelected;
    });
}

async function handleLogout(username) {
    try {
        const result = await client.logout(idTelegram, username);
        displayResult(result, 'success');
        initializeApp(idTelegram);
    } catch (error) {
        displayResult({ error: error.message }, 'error');
    }
}

function enableNavigationButtons() {
    ['draftBtn', 'postBtn', 'accountBtn'].forEach(id => {
        document.getElementById(id).disabled = false;
    });
}

function getUsername() {
    return usernameSelected;
}

function displayResult(result, type = 'success', enabled) {
    if (enabled) {
        //crea una dialog con il risultato
        const dialog = document.createElement('dialog');
        dialog.classList.add('dialog');
        dialog.innerHTML = `
        <h2>Risultato</h2>
        <p>${result.message || result.error}</p>
        <button id="closeButton" class="action-btn">Chiudi</button>
        `;
        document.body.appendChild(dialog);
        dialog.showModal();

        const closeButton = document.getElementById('closeButton');
        closeButton.addEventListener('click', () => {
            dialog.remove();
        });
    }

}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

// API interaction functions
async function login() {
    try {
        const result = await client.login(
            idTelegram,
            document.getElementById('username').value,
            document.getElementById('postingKey').value
        );
        displayResult(result, 'success');
        initializeApp(idTelegram);
    } catch (error) {
        displayResult({ error: error.message }, 'error');
    }
}

async function saveDraft() {
    const dateString = document.getElementById('scheduledTimeDisplay').innerText;

    // Separare la parte della data e dell'ora
    const [datePart, timePart] = dateString.split(', ');
    const [day, month, year] = datePart.split('/');
    const isoFormattedDate = `${year}-${month}-${day}T${timePart}`;
    const dateObject = new Date(isoFormattedDate);
    try {
        const result = await client.saveDraft(
            getUsername(),
            document.getElementById('postTitle').value,
            document.getElementById('postTags').value,
            document.getElementById('postBody').value,
            dateObject,
            new Date().getTimezoneOffset()
        );
        getUserDrafts(); // Refresh the draft list after saving the draft
        displayResult(result, 'success', true);
    } catch (error) {
        displayResult({ error: error.message }, 'error');
    }
}

async function getUserDrafts() {
    try {
        const result = await client.getUserDrafts(getUsername());
        displayResult(result, 'success');
        createListaDrafts(result); // Call the function to create the draft list
        return result;
    } catch (error) {
        displayResult({ error: error.message }, 'error');
        return []; // Return an empty array in case of error
    }
}
// Create list of drafts
function createListaDrafts(drafts) {
    const draftList = document.getElementById('draftList');
    draftList.innerHTML = ''; // Clear existing list

    if (!Array.isArray(drafts) || drafts.length === 0) {
        draftList.appendChild(createDraftListItem('No drafts available'));
        return;
    }

    drafts.forEach((draft, index) => {
        const li = createDraftListItem(`${index + 1}. ${draft.title || 'Untitled Draft'}`, draft.scheduled_time);
        li.onclick = () => loadDraft(draft); // Add click event to load draft

        const buttonsContainer = document.createElement('div');
        buttonsContainer.classList.add('buttons-container');

        const editButton = createIconButton('edit', () => {
            loadDraft(draft);
            prepareShowPage();
        });
        const deleteButton = createIconButton('delete', () => deleteDraft(draft.id));

        buttonsContainer.appendChild(editButton);
        buttonsContainer.appendChild(deleteButton);
        li.appendChild(buttonsContainer);
        draftList.appendChild(li);
    });
}

function createDraftListItem(title, scheduledTime) {
    const li = document.createElement('li');
    li.classList.add('draft-item');

    const titleSpan = document.createElement('span');
    titleSpan.innerText = title;
    li.appendChild(titleSpan);

    if (scheduledTime) {
        const scheduledTimeSpan = document.createElement('span');
        scheduledTimeSpan.innerText = `Scheduled: ${new Date(scheduledTime).toLocaleString()}`;
        scheduledTimeSpan.classList.add('scheduled-time');
        li.appendChild(scheduledTimeSpan);
    }

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
function loadDraft(draft) {
    document.getElementById('postTitle').value = draft.title || '';
    document.getElementById('postTags').value = draft.tags || '';
    document.getElementById('postBody').value = draft.body || '';
    document.getElementById('scheduledTimeDisplay').innerText = draft.scheduled_time ? new Date(draft.scheduled_time).toLocaleString() : '';
}

async function deleteDraft(id) {
    const draftId = id;
    if (!draftId) return;
    try {
        const result = await client.deleteDraft(draftId, getUsername());
        // Refresh the draft list after deleting the draft
        getUserDrafts();
        displayResult(result, 'success', true);
    } catch (error) {
        displayResult({ error: error.message }, 'error');
    }
}

async function postToSteem() {
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
        displayResult({ error: error.message }, 'error', true);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    idTelegram = initializeTelegram();
    initializeApp(idTelegram);
});

