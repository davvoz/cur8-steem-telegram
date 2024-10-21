import { getUsername } from "../services/userManager.js";
import { displayResult } from "../components/dialog.js";
import { showPage } from "./page.js";
import ApiClient from '../api/api-client.js';
import { createIconButton } from "../components/icon.js";

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
    const draftList = document.getElementById('draftList');
    draftList.innerHTML = ''; // Clear existing list
    if (!Array.isArray(drafts) || drafts.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No drafts available';
        draftList.appendChild(li);
        return;
    }
    drafts.sort((a, b) => {
        if (!a.scheduled_time) return 1;
        if (!b.scheduled_time) return -1;
        return new Date(a.scheduled_time) - new Date(b.scheduled_time);
    });
    drafts.forEach(async (draft, index) => {
        const li = await createDraftListItem(index + 1, draft.title || 'Untitled Draft', draft.scheduled_time, draft.tags, draft);
        if (!draft.scheduled_time) {
            li.classList.add('unscheduled-draft');
        }
        draftList.appendChild(li);
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
    
    const message = scheduledTime == "0000-00-00 00:00:00" ? "No scheduled time" : new Date(scheduledTime).toLocaleString();

    const scheduledTimeSpan = createElementWithClass('div', 'scheduled-time', message);
    infoDiv.appendChild(scheduledTimeSpan);
    const titleScheduleContainer = createElementWithClass('div', 'title-schedule-container');
    titleScheduleContainer.append(titleContainer, infoDiv);
    li.appendChild(titleScheduleContainer);
    const communityNameSpan = createElementWithClass('div', 'community-name', await converiIlTagInNomeComunita(tags));
    infoDiv.appendChild(communityNameSpan);
    const buttonsContainer = createElementWithClass('div', 'buttons-container-draft');
    buttonsContainer.append(
        createIconButton('edit', () => {
            loadDraft(draft);
            showPage('postPage');
        }),
        createIconButton('delete', () => deleteDraft(draft.id))
    );
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

async function converiIlTagInNomeComunita(tags) {
    if (!tags) return 'Select a community';
    const tag = tags.split(' ')[0];
    try {
        const communities = await window.listaComunities;
        const community = communities.find(community => community.name === tag);
        return community ? community.title : 'Select a community';
    } catch (error) {
        console.error('Error while searching for community:', error);
        return 'Error occurred while searching for community';
    }
}