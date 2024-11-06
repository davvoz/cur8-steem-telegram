import { communityDialog, displayResult } from "../components/dialog.js";
import { translations } from "../i18n/translations.js";

function t(key) {
    const lang = localStorage.getItem('language') || 'en';
    return translations[lang][key] || key;
}

export class CommunityManager {
    constructor() {
        this.currentFocus = -1;
        this.selectedCommunity = null;
    }

    async initialize() {
        const dialog = communityDialog();
        document.body.appendChild(dialog);
        dialog.showModal();

        const input = document.getElementById("myInput");
        const cancelButton = document.getElementById('cancelButton');

        this.setupEventListeners(dialog, input, cancelButton);
        await this.showAllCommunities();
    }

    setupEventListeners(dialog, input, cancelButton) {
        input.addEventListener("input", (e) => this.handleInput(e));
        input.addEventListener("keydown", (e) => this.handleKeydown(e));
        
        const closeButton = dialog.querySelector('#closeButton');
        closeButton.addEventListener('click', () => dialog.remove());
        
        dialog.addEventListener('close', () => dialog.remove());
    }

    async showAllCommunities() {
        const listElement = document.getElementById("autocomplete-list");
        if (!listElement) return;

        listElement.innerHTML = '';
        
        // Add "No Community" option as first element
        const noCommunityItem = this.createCommunityItem({
            title: t('no_community'),
            name: "",
            isNoCommunity: true
        });
        listElement.appendChild(noCommunityItem);

        try {
            const communities = await window.listaComunities;
            communities.forEach(community => {
                const item = this.createCommunityItem(community);
                listElement.appendChild(item);
            });
        } catch (error) {
            console.error(t('error_loading_community'), error);
            displayResult({ error: error.message }, 'error', true);
        }
    }

    createCommunityItem(community) {
        const item = document.createElement("div");
        item.className = "community-item";
        if (community.isNoCommunity) {
            item.style.paddingBottom = "8px";
            item.style.marginBottom = "8px";
            document.getElementById('comunityName').textContent = t('select_community');
        }
        item.innerHTML = community.title;
        item.innerHTML += `<input type='hidden' value='${community.title}'>`;
        
        item.addEventListener("click", () => {
            document.getElementById('comunityName').textContent = 
                community.isNoCommunity ? t('select_community') : community.title;
            const dialog = document.querySelector('.c-dialogo');
            if (dialog) {
                dialog.remove();
            }
        });

        return item;
    }

    async handleInput(e) {
        const searchText = e.target.value.toLowerCase();
        const listElement = document.getElementById("autocomplete-list");
        
        if (!searchText) {
            await this.showAllCommunities();
            return;
        }

        listElement.innerHTML = '';
        
        // Mantieni sempre visibile l'opzione "No Community"
        const noCommunityItem = this.createCommunityItem({
            title: t('no_community'),
            name: "",
            isNoCommunity: true
        });
        listElement.appendChild(noCommunityItem);

        const communities = await window.listaComunities;
        const filteredCommunities = communities.filter(community => 
            community.title.toLowerCase().includes(searchText)
        );

        filteredCommunities.forEach(community => {
            const item = this.createCommunityItem(community);
            // Evidenzia il testo cercato
            const title = community.title;
            const matchStart = title.toLowerCase().indexOf(searchText);
            const matchEnd = matchStart + searchText.length;

            item.innerHTML = title.substring(0, matchStart) +
                "<strong>" + title.substring(matchStart, matchEnd) + "</strong>" +
                title.substring(matchEnd);
            item.innerHTML += `<input type='hidden' value='${title}'>`;
            
            listElement.appendChild(item);
        });
    }

    handleKeydown(e) {
        const listElement = document.getElementById("autocomplete-list");
        if (!listElement) return;

        const items = listElement.getElementsByTagName("div");
        if (!items.length) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.currentFocus++;
                if (this.currentFocus >= items.length) this.currentFocus = 0;
                this.updateActiveItem(items);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.currentFocus--;
                if (this.currentFocus < 0) this.currentFocus = items.length - 1;
                this.updateActiveItem(items);
                break;
            case 'Enter':
                e.preventDefault();
                if (this.currentFocus > -1) {
                    if (items[this.currentFocus]) {
                        items[this.currentFocus].click();
                    }
                }
                break;
            case 'Escape':
                e.preventDefault();
                document.querySelector('.c-dialogo')?.remove();
                break;
        }
    }

    updateActiveItem(items) {
        Array.from(items).forEach(item => {
            item.classList.remove('autocomplete-active');
        });
        if (items[this.currentFocus]) {
            items[this.currentFocus].classList.add('autocomplete-active');
            items[this.currentFocus].scrollIntoView({ block: 'nearest' });
        }
    }

}