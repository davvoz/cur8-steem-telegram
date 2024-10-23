import { displayResult } from '../components/dialog.js';
import { getUsername } from '../services/userManager.js';
import { getUserDrafts } from './draftPage.js';
import { createDatePickerDialog } from '../components/dialog.js';
import {ApiClient} from '../api/api-client.js';

const client = new ApiClient();
let currentFocus = -1;

export async function postToSteem() {
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

export function svuotaForm() {
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
    window.scheduledTime = null;
}

export async function salvaBozza() {
    if (!validateForm()) {
        return;
    }

    const scheduledDate = getScheduledDate();
    if (scheduledDate === false) {
        return;
    }

    try {
        window.scheduledTime = scheduledDate ? new Date(scheduledDate).toISOString() : '';
        toggleSpinner(true);
        const result = await client.saveDraft(
            getUsername(),
            document.getElementById('postTitle').value,
            document.getElementById('postTags').value,
            document.getElementById('postBody').value,
            window.scheduledTime,
            Intl.DateTimeFormat().resolvedOptions().timeZone
        );
        await getUserDrafts();
        toggleSpinner(false);
        displayResult(result, 'success', true);
    } catch (error) {
        console.error('Error in salvaBozza:', error);
        toggleSpinner(false);
        displayResult({ error: error.message }, 'error', true);
    }
}

function getScheduledDate() {
    const dateString = document.getElementById('openDatePicker').innerText;
    if (dateString && dateString !== 'schedule') {
        const [datePart, timePart] = dateString.split(', ');
        const [day, month, year] = datePart.split('/').map(Number);
        const [hours, minutes, seconds] = timePart.split(':').map(Number);
        const scheduledDate = new Date(year, month - 1, day, hours, minutes, seconds).getTime();
        if (scheduledDate < Date.now()) {
            displayResult({ error: 'La data di pubblicazione non può essere nel passato' }, 'error', true);
            resetDatePicker();
            return false;
        }
        return scheduledDate;
    }
    return null;
}

function resetDatePicker() {
    document.getElementById('openDatePicker').innerHTML = '<i class="material-icons">schedule</i>';
    document.getElementById('openDatePicker').classList.add('action-btn-mini');
    document.getElementById('openDatePicker').classList.remove('action-btn');
}

function toggleSpinner(show) {
    const spinner = document.getElementById('spinner');
    if (show) {
        spinner.classList.remove('hide');
    } else {
        spinner.classList.add('hide');
    }
}

export function openComunitiesAutocomplete() {
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
    window.listaComunities.then((communities) => {
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

export function openDatePicker() {
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

function handleDatePickerConfirm(dialog, scheduledTimeInput) {
    const scheduled = scheduledTimeInput.value;
    window.scheduledTime = new Date(scheduled).getTime();
    document.getElementById('openDatePicker').innerText = new Date(scheduled).toLocaleString();
    document.getElementById('openDatePicker').classList.add('action-btn');
    document.getElementById('openDatePicker').classList.remove('action-btn-mini');
    dialog.remove();
}

function markdownToHtml(markdown) {
    let html = marked.parse(markdown);
    html = DOMPurify.sanitize(html);
    html = html.replace(/<img/g, '<img class="img-fluid"');
    html = html.replace(/<video/g, '<video class="img-fluid"');
    return html;
}

export function togglePreview() {
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