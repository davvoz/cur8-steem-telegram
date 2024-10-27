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
    cleanDraftPage();
    try {
        const result = await client.getUserDrafts(username);
        await createListaDrafts(result, username);
    } catch (error) {
        displayResult({ error: 'Failed to load drafts. Please try again.' }, 'error', true);
    }
}

function cleanDraftPage() {
    const draftList = document.getElementById('draftList');
    draftList.innerHTML = '';
}

async function createListaDrafts(drafts, username) {
    const draftList = document.getElementById('draftList');
    const headerDraft = document.getElementById('headerDraft');

    // Create and append header with tabs
    const header = createHeaderWithTabs();
    draftList.appendChild(header);
    headerDraft.appendChild(header);

    // Create and append draft lists
    const { scheduledList, unscheduledList } = createDraftLists();
    draftList.appendChild(scheduledList);
    draftList.appendChild(unscheduledList);

    // Handle empty drafts case
    if (!Array.isArray(drafts) || drafts.length === 0) {
        appendNoDraftsMessage(scheduledList);
        return;
    }

    // Sort and separate drafts
    const { scheduledDrafts, unscheduledDrafts } = sortAndSeparateDrafts(drafts);

    // Populate draft lists
    await populateDraftLists(scheduledDrafts, unscheduledDrafts, scheduledList, unscheduledList);

    // Add tab switching functionality
    addTabSwitchingFunctionality(header);
}

function createHeaderWithTabs() {
    const tabsContainer = document.createElement('div');
    tabsContainer.classList.add('tabs-container');

    const scheduledTab = createTabButton('Scheduled', true);
    const unscheduledTab = createTabButton('Drafts', false);

    tabsContainer.appendChild(scheduledTab);
    tabsContainer.appendChild(unscheduledTab);

    const header = document.createElement('div');
    header.classList.add('header');
    header.appendChild(tabsContainer);

    return header;
}

function createDraftLists() {
    const scheduledList = document.createElement('ul');
    scheduledList.classList.add('draft-list', 'active');

    const unscheduledList = document.createElement('ul');
    unscheduledList.classList.add('draft-list');

    return { scheduledList, unscheduledList };
}

function appendNoDraftsMessage(list) {
    const li = document.createElement('li');
    li.textContent = 'No drafts available';
    list.appendChild(li);
}

function sortAndSeparateDrafts(drafts) {
    drafts.sort((a, b) => {
        if (!a.scheduled_time) return 1;
        if (!b.scheduled_time) return -1;
        return new Date(a.scheduled_time) - new Date(b.scheduled_time);
    });

    const scheduledDrafts = drafts.filter(draft => draft.scheduled_time && draft.scheduled_time !== "0000-00-00 00:00:00");
    const unscheduledDrafts = drafts.filter(draft => !draft.scheduled_time || draft.scheduled_time === "0000-00-00 00:00:00");

    return { scheduledDrafts, unscheduledDrafts };
}

async function populateDraftLists(scheduledDrafts, unscheduledDrafts, scheduledList, unscheduledList) {
    let scheduledCount = 0;
    let unscheduledCount = 0;

    for (const draft of scheduledDrafts) {
        scheduledCount++;
        const li = await createDraftListItem(scheduledCount, draft.title || 'Untitled Draft', draft.scheduled_time, draft);
        scheduledList.appendChild(li);
    }

    for (const draft of unscheduledDrafts) {
        unscheduledCount++;
        const li = await createDraftListItem(unscheduledCount, draft.title || 'Untitled Draft', draft.scheduled_time, draft);
        li.classList.add('unscheduled-draft');
        unscheduledList.appendChild(li);
    }
}

function addTabSwitchingFunctionality(header) {
    const tabs = header.querySelectorAll('.tab-button');
    const lists = document.querySelectorAll('.draft-list');

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            lists.forEach(list => list.classList.remove('active'));

            tab.classList.add('active');
            lists[index].classList.add('active');
        });
    });
}

// Helper function to create tab buttons
function createTabButton(text, isActive = false) {
    const button = document.createElement('button');
    button.textContent = text;
    button.classList.add('tab-button');
    if (isActive) button.classList.add('active');
    return button;
}

async function createDraftListItem(id, title, scheduledTime, draft) {
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

