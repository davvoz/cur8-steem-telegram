import {ApiClient} from '../api/api-client.js';
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