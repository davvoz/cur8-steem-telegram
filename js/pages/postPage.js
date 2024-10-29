import { displayResult } from '../components/dialog.js';
import { getUsername } from '../services/userManager.js';
import { getUserDrafts } from './draftPage.js';
import { createDatePickerDialog } from '../components/dialog.js';
import { ApiClient } from '../api/api-client.js';
import { CommunityManager } from '../core/CommunityManager.js';

class PostManager {
    constructor() {
        this.client = new ApiClient();
        this.scheduledTime = null;
    }

    async postToSteem() {
        if (!this.validateForm()) {
            return;
        }

        const dialog = this.createDialog('Conferma Pubblicazione', 'Sei sicuro di voler pubblicare questo post su Steem?', 'confirmButtonPost', 'cancelButtonPost');
        document.body.appendChild(dialog);
        dialog.showModal();

        dialog.querySelector('#confirmButtonPost').addEventListener('click', async () => {
            dialog.remove();
            try {
                const result = await this.client.postToSteem(
                    getUsername(),
                    document.getElementById('postTitle').value,
                    document.getElementById('postBody').value,
                    document.getElementById('postTags').value,
                    this.scheduledTime,
                );
                displayResult(result, 'success', true);
            } catch (error) {
                console.error('Error in postToSteem:', error);
                displayResult({ error: error.message }, 'error', true);
            }
        });

        dialog.querySelector('#cancelButtonPost').addEventListener('click', () => {
            dialog.remove();
        });

        dialog.addEventListener('close', () => {
            dialog.remove();
        });
    }

    validateForm() {
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

    svuotaForm() {
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
        this.scheduledTime = null;
    }

    async salvaBozza() {
        if (!this.validateForm()) {
            return;
        }

        const scheduledDate = this.getScheduledDate();
        if (scheduledDate === false) {
            return;
        }

        try {
            this.scheduledTime = scheduledDate ? new Date(scheduledDate).toISOString() : '';
            this.toggleSpinner(true);
            const result = await this.client.saveDraft(
                getUsername(),
                document.getElementById('postTitle').value,
                document.getElementById('postTags').value,
                document.getElementById('postBody').value,
                this.scheduledTime,
                Intl.DateTimeFormat().resolvedOptions().timeZone
            );
            await getUserDrafts();
            this.toggleSpinner(false);
            displayResult(result, 'success', true);
        } catch (error) {
            console.error('Error in salvaBozza:', error);
            this.toggleSpinner(false);
            displayResult({ error: error.message }, 'error', true);
        }
    }

    getScheduledDate() {
        const dateString = document.getElementById('openDatePicker').innerText;
        if (dateString && dateString !== 'schedule') {
            const [datePart, timePart] = dateString.split(', ');
            const [day, month, year] = datePart.split('/').map(Number);
            const [hours, minutes, seconds] = timePart.split(':').map(Number);
            const scheduledDate = new Date(year, month - 1, day, hours, minutes, seconds).getTime();
            if (scheduledDate < Date.now()) {
                displayResult({ error: 'La data di pubblicazione non può essere nel passato' }, 'error', true);
                this.resetDatePicker();
                return false;
            }
            return scheduledDate;
        }
        return null;
    }

    resetDatePicker() {
        document.getElementById('openDatePicker').innerHTML = '<i class="material-icons">schedule</i>';
        document.getElementById('openDatePicker').classList.add('action-btn-mini');
        document.getElementById('openDatePicker').classList.remove('action-btn');
    }

    toggleSpinner(show) {
        const spinner = document.getElementById('spinner');
        if (show) {
            spinner.classList.remove('hide');
        } else {
            spinner.classList.add('hide');
        }
    }

    openDatePicker() {
        
        const dialog = createDatePickerDialog();
        document.body.appendChild(dialog);
        dialog.showModal();
        //se window.scheduledTime è diverso da null allora la data è già stata impostata
        //dobbiamo valorizzare il campo <input type="datetime-local" id="scheduledTime" name="scheduledTime"> con la data impostata
        if(window.scheduledTime){   
            document.getElementById('scheduledTime').value = new Date(window.scheduledTime).toISOString().slice(0, 16);
        }
        const confirmButton = dialog.querySelector('#confirmButtonDP');
        const chiudiButton = dialog.querySelector('#closeButton');
        const scheduledTimeInput = dialog.querySelector('#scheduledTime');
        const cancella = dialog.querySelector('#annullaButtonDP');
        cancella.addEventListener('click', () => this.handleDatePickerCancel(dialog));
        confirmButton.addEventListener('click', () => this.handleDatePickerConfirm(dialog, scheduledTimeInput));
        chiudiButton.addEventListener('click', () => dialog.remove());
        dialog.addEventListener('close', () => dialog.remove());

    }

    handleDatePickerCancel(dialog) {
        dialog.remove();
        document.getElementById('openDatePicker').innerHTML = '<i class="material-icons">schedule</i>';
        document.getElementById('openDatePicker').classList.add('action-btn-mini');
        document.getElementById('openDatePicker').classList.remove('action-btn');
        this.scheduledTime = null;
        //inizializzo il datepicker gg/mm/aa hh:mm
        document.getElementById('scheduledTime').value = null
    }

    handleDatePickerConfirm(dialog, scheduledTimeInput) {
        const scheduled = scheduledTimeInput.value;
        this.scheduledTime = new Date(scheduled).getTime();
        document.getElementById('openDatePicker').innerText = new Date(scheduled).toLocaleString();
        document.getElementById('openDatePicker').classList.add('action-btn');
        document.getElementById('openDatePicker').classList.remove('action-btn-mini');
        dialog.remove();
    }

    markdownToHtml(markdown) {
        let html = marked.parse(markdown);
        html = DOMPurify.sanitize(html);
        html = html.replace(/<img/g, '<img class="img-fluid"');
        html = html.replace(/<video/g, '<video class="img-fluid"');
        return html;
    }

    togglePreview() {
        const postBody = document.getElementById('postBody').value;
        const previewContent = document.getElementById('previewContent');
        const title = document.getElementById('postTitle').value;
        previewContent.innerHTML = `<h1>${title}</h1>`;
        previewContent.innerHTML += this.markdownToHtml(postBody);
        const modal = document.getElementById('previewModal');
        modal.classList.add('modalio');
        modal.style.display = 'block';
        const closeButton = document.querySelector('.close-button');
        closeButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    cancellaBozza() {
        const dialog = this.createDialog('Conferma', 'Pulisci i campi', 'confirmButtonDelete', 'cancelButtonDelete');
        document.body.appendChild(dialog);
        dialog.showModal();

        dialog.querySelector('#confirmButtonDelete').addEventListener('click', async () => {
            dialog.remove();
            this.svuotaForm();
        });

        dialog.querySelector('#cancelButtonDelete').addEventListener('click', () => {
            dialog.remove();
        });
    }

    createDialog(title, message, confirmButtonId, cancelButtonId) {
        const dialog = document.createElement('dialog');
        dialog.classList.add('dialogo');
        dialog.innerHTML = `
            <h2>${title}</h2>
            <p>${message}</p>
            <button id="${confirmButtonId}" class="action-btn">Conferma</button>
            <button id="${cancelButtonId}" class="action-btn">Annulla</button>
        `;
        return dialog;
    }
}

class CommunityManagerWrapper {
    openComunitiesAutocomplete() {
        const manager = new CommunityManager();
        manager.initialize();
    }
}

const postManager = new PostManager();
const communityManagerWrapper = new CommunityManagerWrapper();

export const postToSteem = postManager.postToSteem.bind(postManager);
export const svuotaForm = postManager.svuotaForm.bind(postManager);
export const salvaBozza = postManager.salvaBozza.bind(postManager);
export const openDatePicker = postManager.openDatePicker.bind(postManager);
export const togglePreview = postManager.togglePreview.bind(postManager);
export const cancellaBozza = postManager.cancellaBozza.bind(postManager);
export const openComunitiesAutocomplete = communityManagerWrapper.openComunitiesAutocomplete.bind(communityManagerWrapper);