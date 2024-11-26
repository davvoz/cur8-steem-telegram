import { displayResult, createDatePickerDialog } from '../components/dialog.js';
import { getUsername } from '../services/userManager.js';
import { getUserDrafts } from './draftPage.js';
import { ApiClient } from '../api/api-client.js';
import { CommunityManager } from '../core/CommunityManager.js';
import { translations } from '../i18n/translations.js';

// Add translation helper
function t(key) {
    const lang = localStorage.getItem('language') || 'en';
    return translations[lang][key] || key;
}

class PostManager {
    constructor() {
        this.client = new ApiClient();
        this.scheduledTime = null;
    }

    async postToSteem() {
        if (!this.validateForm()) {
            return;
        }

        const dialog = this.createDialog(t('dialog_confirm'), t('confirm_post'), 'confirmButtonPost', 'cancelButtonPost');
        document.body.appendChild(dialog);
        dialog.showModal();

        dialog.querySelector('#confirmButtonPost').addEventListener('click', async () => {
            dialog.remove();
            try {
                this.toggleSpinner(true);
                const result = await this.client.postToSteem(
                    getUsername(),
                    document.getElementById('postTitle').value,
                    document.getElementById('postBody').value,
                    document.getElementById('postTags').value,
                    document.getElementById('comunityName').textContent
                );
                this.toggleSpinner(false);
                displayResult(result, 'success', true);
            } catch (error) {
                console.error('Error in postToSteem:', error);
                this.toggleSpinner(false);
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
            errorMessage += t('post_title_required') + '\n';
        }
        if (body === '') {
            isValid = false;
            errorMessage += t('post_body_required') + '\n';
        }
        if (tags === '') {
            isValid = false;
            errorMessage += t('post_tags_required') + '\n';
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

        document.getElementById('comunityName').innerText = t('select_community');
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
                Intl.DateTimeFormat().resolvedOptions().timeZone,
                document.getElementById('comunityName').textContent
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
                displayResult({ error: t('schedule_past_date_error') }, 'error', true);
                this.resetDatePicker();
                return null;
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
        document.getElementById('scheduledTime').value = null

        dialog.remove();
        document.getElementById('openDatePicker').innerHTML = '<i class="material-icons">schedule</i>';
        document.getElementById('openDatePicker').classList.add('action-btn-mini');
        document.getElementById('openDatePicker').classList.remove('action-btn');
        this.scheduledTime = null;
    }

    handleDatePickerConfirm(dialog, scheduledTimeInput) {
        const scheduled = scheduledTimeInput.value;
        const scheduledDate = new Date(scheduled).getTime();
        if (isNaN(scheduledDate)) {
            displayResult({ error: t('no_scheduled_time') }, 'error', true);
            this.resetDatePicker();
            return;
        }
        if (scheduledDate < Date.now()) {
            displayResult({ error: t('schedule_past_date_error') }, 'error', true);
            this.resetDatePicker();
            return;
        }
        this.scheduledTime = scheduledDate;
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
        const dialog = this.createDialog(t('dialog_confirm'), t('confirm_delete'), 'confirmButtonDelete', 'cancelButtonDelete');
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
            <button id="${confirmButtonId}" class="action-btn">${t('dialog_confirm')}</button>
            <button id="${cancelButtonId}" class="action-btn">${t('dialog_cancel')}</button>
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