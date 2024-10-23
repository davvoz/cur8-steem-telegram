import { getUsername } from "../services/userManager.js";
import { displayResult } from "../components/dialog.js";
import { ApiClient } from '../api/api-client.js';
import { createIconButton } from "../components/icon.js";
import { appState } from '../core/AppState.js';
import { converiIlTagInNomeComunita } from "../services/utils.js";

const client = new ApiClient();

export async function getUserDrafts() {
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

async function createListaDrafts(drafts, username) {
    // Create tabs container
    const tabsContainer = document.createElement('div');
    tabsContainer.classList.add('tabs-container');
    
    // Create tab buttons
    const scheduledTab = document.createElement('button');
    scheduledTab.textContent = 'Scheduled';
    scheduledTab.classList.add('tab-button', 'active');
    
    const unscheduledTab = document.createElement('button');
    unscheduledTab.textContent = 'Unscheduled';
    unscheduledTab.classList.add('tab-button');
    
    tabsContainer.append(scheduledTab, unscheduledTab);
    
    // Create lists containers
    const scheduledList = document.createElement('ul');
    scheduledList.id = 'scheduledList';
    scheduledList.classList.add('draft-list', 'active');
    
    const unscheduledList = document.createElement('ul');
    unscheduledList.id = 'unscheduledList';
    unscheduledList.classList.add('draft-list');
    
    // Clear and update the main container
    const draftList = document.getElementById('draftList');
    draftList.innerHTML = '';
    draftList.append(tabsContainer, scheduledList, unscheduledList);

    // Handle empty drafts case
    if (!Array.isArray(drafts) || drafts.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No drafts available';
        scheduledList.appendChild(li);
        return;
    }

    // Sort drafts
    drafts.sort((a, b) => {
        if (!a.scheduled_time) return 1;
        if (!b.scheduled_time) return -1;
        return new Date(a.scheduled_time) - new Date(b.scheduled_time);
    });

    // Separate drafts into scheduled and unscheduled
    let scheduledCount = 1;
    let unscheduledCount = 1;

    for (const draft of drafts) {
        const li = await createDraftListItem(
            draft.scheduled_time ? scheduledCount++ : unscheduledCount++,
            draft.title || 'Untitled Draft',
            draft.scheduled_time,
            draft.tags,
            draft
        );

        if (draft.scheduled_time && draft.scheduled_time !== "0000-00-00 00:00:00") {
            scheduledList.appendChild(li);
        } else {
            li.classList.add('unscheduled-draft');
            unscheduledList.appendChild(li);
        }
    }

    // Add tab switching functionality
    scheduledTab.addEventListener('click', () => {
        scheduledTab.classList.add('active');
        unscheduledTab.classList.remove('active');
        scheduledList.classList.add('active');
        unscheduledList.classList.remove('active');
    });

    unscheduledTab.addEventListener('click', () => {
        unscheduledTab.classList.add('active');
        scheduledTab.classList.remove('active');
        unscheduledList.classList.add('active');
        scheduledList.classList.remove('active');
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

    const message = scheduledTime == "0000-00-00 00:00:00"
        ? "No scheduled time"
        : new Date(scheduledTime).toLocaleString();

    const scheduledTimeSpan = createElementWithClass('div', 'scheduled-time', message);
    infoDiv.appendChild(scheduledTimeSpan);

    const titleScheduleContainer = createElementWithClass('div', 'title-schedule-container');
    titleScheduleContainer.append(titleContainer, infoDiv);
    li.appendChild(titleScheduleContainer);
    const buttonsContainer = createElementWithClass('div', 'buttons-container-draft');

    appState.setCurrentDraft(draft);
    const editButton = createIconButton('edit', () => {
        loadDraft(draft);
    });
    editButton.setAttribute('data-draft-id', draft.id);
    editButton.classList.add('edit-button');
    editButton.id = `edit-draft-${draft.id}`;

    const deleteButton = createIconButton('delete', () => deleteDraft(draft.id));
    deleteButton.id = `delete-draft-${draft.id}`;

    buttonsContainer.append(editButton, deleteButton);
    li.appendChild(buttonsContainer);

    return li;
}

function createElementWithClass(tag, className, textContent = '') {
    const element = document.createElement(tag);
    element.classList.add(className);
    element.textContent = textContent;
    return element;
}

async function loadDraft(draft) {
    console.log('Loading draft:', draft);
    document.getElementById('postTitle').value = draft.title || '';
    document.getElementById('postTags').value = draft.tags || '';
    document.getElementById('postBody').value = draft.body || '';
    document.getElementById('comunityName').innerText = await converiIlTagInNomeComunita(draft.tags);
    if (draft.scheduled_time !== '0000-00-00 00:00:00') {
        document.getElementById('openDatePicker').innerText = new Date(draft.scheduled_time).toLocaleString();
        document.getElementById('openDatePicker').classList.add('action-btn');
        document.getElementById('openDatePicker').classList.remove('action-btn-mini');
    } else {
        document.getElementById('openDatePicker').innerHTML = '<i class="material-icons">schedule</i>';
        document.getElementById('openDatePicker').classList.add('action-btn-mini');
        document.getElementById('openDatePicker').classList.remove('action-btn');
    }

    window.scheduledTime = draft.scheduled_time;
    window.location.hash = `#/draft/edit/${draft.id}`;
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

