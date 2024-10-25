import { displayResult } from '../components/dialog.js';
import { getUsername } from '../services/userManager.js';
import { getUserDrafts } from './draftPage.js';
import { createDatePickerDialog } from '../components/dialog.js';
import {ApiClient} from '../api/api-client.js';
import { CommunityManager } from '../core/CommunityManager.js';
const client = new ApiClient();

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

export function openDatePicker() {
    const dialog = createDatePickerDialog();
    document.body.appendChild(dialog);
    dialog.showModal();
    const confirmButton = dialog.querySelector('#confirmButtonDP');
    const cancelButton = dialog.querySelector('#cancelButtonDP');
    const scheduledTimeInput = dialog.querySelector('#scheduledTime');
    confirmButton.addEventListener('click', () => handleDatePickerConfirm(dialog, scheduledTimeInput));
    cancelButton.addEventListener('click', () => handleDatePickerCancel(dialog));
    dialog.addEventListener('close', () => dialog.remove());
}

function handleDatePickerCancel(dialog) {
    dialog.remove();
    document.getElementById('openDatePicker').innerHTML = '<i class="material-icons">schedule</i>';
    document.getElementById('openDatePicker').classList.add('action-btn-mini');
    document.getElementById('openDatePicker').classList.remove('action-btn');
    window.scheduledTime = null;
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
    //titolo del post
    const title = document.getElementById('postTitle').value;
    previewContent.innerHTML = `<h1>${title}</h1>`;
    //corpo del post
    previewContent.innerHTML += markdownToHtml(postBody);
    const modal = document.getElementById('previewModal');
    //classi per il modal 
    modal.classList.add('modalio');

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

export  function cancellaBozza() {
    const dialog = document.createElement('dialog');
    dialog.classList.add('dialogo');
    dialog.innerHTML = `
        <h2>Conferma</h2>
        <p>Pulisci i campi</p>
        <button id="confirmButtonDelete" class="action-btn">Conferma</button>
        <button id="cancelButtonDelete" class="action-btn">Annulla</button>
    `;
    document.body.appendChild(dialog);
    dialog.showModal();
    const confirmButton = dialog.querySelector('#confirmButtonDelete');
    const cancelButton = dialog.querySelector('#cancelButtonDelete');
    
    //svuota il form se conferma
    confirmButton.addEventListener('click', async () => {
        dialog.remove();
        svuotaForm();
    });

    //chiudi la dialog se annulla
    cancelButton.addEventListener('click', () => {
        dialog.remove();
    });
}



export function openComunitiesAutocomplete() {
    const manager = new CommunityManager();
    manager.initialize();
}