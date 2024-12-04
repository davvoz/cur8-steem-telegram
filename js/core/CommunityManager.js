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
        this.communities = [];
    }

    async initialize() {
        const dialog = communityDialog();
        document.body.appendChild(dialog);
        dialog.showModal();

        const input = document.getElementById("myInput");
        const cancelButton = document.getElementById('cancelButton');

        this.setupEventListeners(dialog, input, cancelButton);
        await this.loadCommunities();
        await this.showAllCommunities();
    }

    async loadCommunities() {
        try {
            this.communities = await window.listaComunities;
            // Controllo se le comunità sono un array e non sono vuote
            if (!Array.isArray(this.communities)) {
                throw new Error(t('invalid_community_data'));
            }
        } catch (error) {
            console.error(t('error_loading_community'), error);
            displayResult({ error: error.message }, 'error', true);
        }
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
        const fragment = document.createDocumentFragment();
        
        fragment.appendChild(this.createCommunityItem({
            title: t('no_community'),
            name: "",
            isNoCommunity: true
        }));

        this.communities.forEach(community => {
            fragment.appendChild(this.createCommunityItem(community));
        });

        listElement.appendChild(fragment);
    }

    createCommunityItem(community) {
        const item = document.createElement("div");
        item.className = "community-item";
        item.style.paddingBottom = community.isNoCommunity ? "8px" : "";
        item.style.marginBottom = community.isNoCommunity ? "8px" : "";
        
        item.innerHTML = `
            ${community.title || t('unknown_community')}
            <input type='hidden' value='${community.title || ''}'>
        `;

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
        const fragment = document.createDocumentFragment();
        
        fragment.appendChild(this.createCommunityItem({
            title: t('no_community'),
            name: "",
            isNoCommunity: true
        }));

        const filteredCommunities = this.communities.filter(community => 
            community?.title?.toLowerCase().includes(searchText)
        );

        filteredCommunities.forEach(community => {
            const item = this.createCommunityItem(community);
            const title = community.title;
            const matchStart = title.toLowerCase().indexOf(searchText);
            const matchEnd = matchStart + searchText.length;

            item.innerHTML = `
                ${title.substring(0, matchStart)}
                <strong>${title.substring(matchStart, matchEnd)}</strong>
                ${title.substring(matchEnd)}
                <input type='hidden' value='${title}'>
            `;
            fragment.appendChild(item);
        });

        listElement.appendChild(fragment);
    }

    handleKeydown(e) {
        const listElement = document.getElementById("autocomplete-list");
        if (!listElement) return;

        const items = listElement.getElementsByTagName("div");
        if (!items.length) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.currentFocus = (this.currentFocus + 1) % items.length;
                this.updateActiveItem(items);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.currentFocus = (this.currentFocus - 1 + items.length) % items.length;
                this.updateActiveItem(items);
                break;
            case 'Enter':
                e.preventDefault();
                if (this.currentFocus > -1 && items[this.currentFocus]) {
                    items[this.currentFocus].click();
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