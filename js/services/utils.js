import { ApiClient } from '../api/api-client.js';
import { displayResult } from '../components/dialog.js';
import { setUsernameForImageUpload } from '../api/image-upload.js';
import { showPage } from '../services/pageService.js';
import { createAccountListItem, selectAccount } from '../pages/accountListPage.js';

let usernames = [];

export function initializeEnd(result) {
    enableNavigationButtons();
    console.log('initializeEnd', result);
    window.listaComunities = getListaComunities();
    usernames = result.usernames;
    const accountList = document.getElementById('accountList');
    accountList.innerHTML = '';
    usernames.forEach(createAccountListItem);
    if (usernames.length > 0) {
        window.usernameSelected = usernames[0];
        document.getElementById('titleGestionBozze').innerText = `Gestione Bozze di ${window.usernameSelected.username}`;
        setUsernameForImageUpload(window.usernameSelected.username, localStorage.getItem('idTelegram'));
        const firstAccountContainer = accountList.querySelector('.container-username');
        if (firstAccountContainer) {
            selectAccount(window.usernameSelected, firstAccountContainer);
        }
    }
    document.getElementById('spinner').classList.add('hide');
    showPage('accountPage');
    displayResult(result);
}

export function enableNavigationButtons() {
    ['draftBtn', 'postBtn', 'accountBtn', 'configBtn'].forEach(id => {
        document.getElementById(id).disabled = false;
    });
}

export async function getListaComunities() {
    try {
        const client = new ApiClient();
        const result = await client.listaComunities();
        displayResult(result, 'success');
        return result;
    } catch (error) {
        console.error('Error in getListaComunities:', error);
        displayResult({ error: error.message }, 'error');
    }
}

export function getUsernames() {
    return usernames;
}

export function setUsernames(value) {
    usernames = value;
}

export async function converiIlTagInNomeComunita(tags) {
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

export async function loadDraftData(draft) {
    
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