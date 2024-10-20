import { displayResult } from '../components/dialog.js';
import { getUsername} from '../services/userManager.js';
import { getUserDrafts } from './draftPage.js';
import ApiClient from '../api/api-client.js';

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

export function validateForm() {
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
            window.scheduledTime = scheduledDate ? new Date(scheduledDate).toISOString() : '';
            const result = await client.saveDraft(
                getUsername(),
                document.getElementById('postTitle').value,
                document.getElementById('postTags').value,
                document.getElementById('postBody').value,
                window.scheduledTime,
                Intl.DateTimeFormat().resolvedOptions().timeZone
            );
            await getUserDrafts(); // Ricarica i draft dopo il salvataggio
            displayResult(result, 'success', true);
        } catch (error) {
            console.error('Error in salvaBozza:', error);
            displayResult({ error: error.message }, 'error', true);
        }
    }
    