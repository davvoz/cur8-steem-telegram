import { ApiClient } from '../api/api-client.js';
import { displayResult } from '../components/dialog.js';
import { t } from '../i18n/translationService.js';

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

export async function converiIlTagInNomeComunita(communityName) {
    if (!communityName) return t('select_community');
    try {
        const communities = await window.listaComunities;
        const community = communities.find(community => community.name === communityName);
        return community ? community.title : t('select_community');
    } catch (error) {
        console.error('Error while searching for community:', error);
        return t('error_loading_community');
    }
}

export async function convertiNomeComunitaInTag(title) {
    if (!communityName) return '';
    try {
        const communities = await window.listaComunities;
        const community = communities.find(community => community.title === title);
        return community ? community.name : '';
    } catch (error) {
        console.error('Error while searching for community:', error);
        return '';
    }
}
