import { getUsername } from "../services/userManager.js";
import { displayResult } from "../components/dialog.js";
import { ApiClient } from '../api/api-client.js';
import { createIconButton } from "../components/icon.js";
import { appState } from "../core/AppState.js";

class ApiService {
    constructor(client) {
        this.client = client;
    }

    async getUserDrafts(username) {
        try {
            return await this.client.getUserDrafts(username);
        } catch (error) {
            throw new Error('Failed to load drafts. Please try again.');
        }
    }

    async deleteDraft(draftId, username) {
        try {
            return await this.client.deleteDraft(draftId, username);
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

class DraftManager {
    constructor(apiService) {
        this.apiService = apiService;
        this.activeTabIndex = 1; // Track the active tab index
    }

    async loadUserDrafts() {
        console.log('Loading drafts...');
        const username = getUsername();
        if (!username) return;

        const previousActiveIndex = this.activeTabIndex; // Store the current active tab
        this.cleanDraftPage();
        try {
            const drafts = await this.apiService.getUserDrafts(username);
            this.createDraftList(drafts);
            // Restore the previously active tab
            this.switchTab(previousActiveIndex);
        } catch (error) {
            displayResult({ error: error.message }, 'error', true);
        }
    }

    cleanDraftPage() {
        const draftList = document.getElementById('draftList');
        const headerDraft = document.getElementById('headerDraft');
        draftList.innerHTML = '';
        headerDraft.innerHTML = '';
    }

    createHeaderWithTabs() {
        const tabsContainer = this.createElementWithClass('div', 'tabs-container');
        const scheduledTab = this.createTabButton('Scheduled', this.activeTabIndex === 0);
        const unscheduledTab = this.createTabButton('Drafts', this.activeTabIndex === 1);

        scheduledTab.addEventListener('click', () => {
            this.switchTab(0);
        });

        unscheduledTab.addEventListener('click', () => {
            this.switchTab(1);
        });

        tabsContainer.append(scheduledTab, unscheduledTab);

        const header = this.createElementWithClass('div', 'header');
        header.appendChild(tabsContainer);
        return header;
    }

    switchTab(index) {
        const tabs = document.querySelectorAll('.tab-button');
        const lists = document.querySelectorAll('.draft-list');

        tabs.forEach(t => t.classList.remove('active'));
        lists.forEach(list => list.classList.remove('active'));

        tabs[index].classList.add('active');
        lists[index].classList.add('active');
        this.activeTabIndex = index; // Update the active tab index
    }

    createDraftLists() {
        const scheduledList = this.createElementWithClass('ul', 'draft-list');
        scheduledList.classList.add('active');
        const unscheduledList = this.createElementWithClass('ul', 'draft-list');
        return { scheduledList, unscheduledList };
    }

    createDraftList(drafts) {
        const draftList = document.getElementById('draftList');
        const headerDraft = document.getElementById('headerDraft');

        const header = this.createHeaderWithTabs();
        draftList.appendChild(header);
        headerDraft.appendChild(header);

        const { scheduledList, unscheduledList } = this.createDraftLists();
        draftList.append(scheduledList, unscheduledList);

        if (!Array.isArray(drafts) || drafts.length === 0) {
            this.appendNoDraftsMessage(scheduledList);
            this.appendNoDraftsMessage(unscheduledList);
            return;
        }



        const { scheduledDrafts, unscheduledDrafts } = this.sortAndSeparateDrafts(drafts);
        this.populateDraftLists(scheduledDrafts, unscheduledDrafts, scheduledList, unscheduledList);
    }

    createTabButton(text, isActive = false) {
        const button = this.createElementWithClass('button', 'tab-button', text);
        if (isActive) button.classList.add('active');
        return button;
    }

    appendNoDraftsMessage(list) {
        const li = this.createElementWithClass('li', 'noDraftsMessage', 'No drafts available');
        list.appendChild(li);
    }

    sortAndSeparateDrafts(drafts) {
        drafts.sort((a, b) => new Date(a.scheduled_time || 0) - new Date(b.scheduled_time || 0));

        const scheduledDrafts = drafts.filter(d => d.scheduled_time && d.scheduled_time !== "0000-00-00 00:00:00");
        const unscheduledDrafts = drafts.filter(d => !d.scheduled_time || d.scheduled_time === "0000-00-00 00:00:00");

        return { scheduledDrafts, unscheduledDrafts };
    }

    populateDraftLists(scheduledDrafts, unscheduledDrafts, scheduledList, unscheduledList) {
        scheduledDrafts.forEach((draft, index) => {
            const li = this.createDraftListItem(index + 1, draft);
            scheduledList.appendChild(li);
        });

        unscheduledDrafts.forEach((draft, index) => {
            const li = this.createDraftListItem(index + 1, draft);
            li.classList.add('unscheduled-draft');
            unscheduledList.appendChild(li);
        });
    }

    createDraftListItem(id, draft) {
        const li = this.createElementWithClass('li', 'draft-item');

        const titleSpan = this.createElementWithClass('span', 'draft-title', draft.title || 'Untitled Draft');
        const idDiv = this.createElementWithClass('div', 'draft-id', id);
        const titleContainer = this.createElementWithClass('div', 'title-container');
        titleContainer.append(idDiv, titleSpan);

        const infoDiv = this.createElementWithClass('div', 'draft-info');
        infoDiv.style.flexDirection = 'column';

        const message = draft.scheduled_time === "0000-00-00 00:00:00" ? "No scheduled time" : new Date(draft.scheduled_time).toLocaleString();
        const scheduledTimeSpan = this.createElementWithClass('div', 'scheduled-time', message);
        infoDiv.appendChild(scheduledTimeSpan);

        const titleScheduleContainer = this.createElementWithClass('div', 'title-schedule-container');
        titleScheduleContainer.append(titleContainer, infoDiv);
        li.appendChild(titleScheduleContainer);

        const buttonsContainer = this.createElementWithClass('div', 'buttons-container-draft');

        appState.setCurrentDraft(draft);
        const editButton = createIconButton('edit', () => {
            this.loadDraft(draft);
        });
        editButton.setAttribute('data-draft-id', draft.id);
        editButton.classList.add('edit-button');
        editButton.id = `edit-draft-${draft.id}`;

        const deleteButton = createIconButton('delete', () => this.confirmAndDeleteDraft(draft.id));

        buttonsContainer.append(editButton, deleteButton);
        li.appendChild(buttonsContainer);

        return li;
    }

    createElementWithClass(tag, className, textContent = '') {
        try {
            const element = document.createElement(tag);
            element.classList.add(className);
            element.textContent = textContent;
            return element;
        } catch (error) {
            console.error('Error creating element:', error);
            return null;
        }
    }

    async loadDraft(draft) {
        document.getElementById('postTitle').value = draft.title || '';
        document.getElementById('postTags').value = draft.tags || '';
        document.getElementById('postBody').value = draft.body || '';
        document.getElementById('comunityName').innerText = draft.community ? draft.community : 'Select a community';

        const scheduledTimeEl = document.getElementById('openDatePicker');
        if (draft.scheduled_time !== '0000-00-00 00:00:00') {
            scheduledTimeEl.innerText = new Date(draft.scheduled_time).toLocaleString();
        } else {
            scheduledTimeEl.innerHTML = '<i class="material-icons">schedule</i>';
        }
        window.scheduledTime = draft.scheduled_time;
        window.location.hash = `#/draft/edit/${draft.id}`;

    }

    async confirmAndDeleteDraft(draftId) {
        const confirm = await this.showDeleteConfirmation();
        if (confirm) {
            try {
                const result = await this.apiService.deleteDraft(draftId, getUsername());
                this.loadUserDrafts();
                displayResult(result, 'success', true);
            } catch (error) {
                displayResult({ error: error.message }, 'error');
            }
        }
    }

    showDeleteConfirmation() {
        return new Promise((resolve) => {
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

            dialog.querySelector('#confirmButtonDelete').addEventListener('click', () => {
                dialog.close();
                resolve(true);
            });

            dialog.querySelector('#cancelButtonDelete').addEventListener('click', () => {
                dialog.close();
                resolve(false);
            });

            dialog.addEventListener('close', () => {
                dialog.remove();
            });
        });
    }
}

// Instantiating classes and initiating operations
const client = new ApiClient();
const apiService = new ApiService(client);
const draftManager = new DraftManager(apiService);

// Exporting a single function for initiating the draft loading
export async function getUserDrafts() {
    draftManager.loadUserDrafts();
}
