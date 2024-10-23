import { ApiClient } from '../api/api-client.js';
import { displayResult } from '../components/dialog.js';


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
