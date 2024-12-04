import { displayResult } from '../components/dialog.js';
import { applySavedTheme } from '../components/theme.js';
import { setUsernameForImageUpload } from '../api/image-upload.js';
import { getUserDrafts } from './draftPage.js';
import { ApiClient } from '../api/api-client.js';
import  appInitializerInstance  from '../core/AppInitializer.js';
import { t } from '../i18n/translationService.js';
import { Url_parameters } from '../services/parameters.js';

export class AccountManager {
    constructor(apiClient = new ApiClient()) {
        this.apiClient = apiClient;
    }

    platform_logo() {
        const url = Url_parameters()
        const params = new URLSearchParams(url.search);
        const platform = params.get('platform');
        const logo = document.getElementById('platformLogo');
    
        if (platform === 'STEEM') {
            logo.src = 'assets/logo_steem.png'; // Percorso del logo per STEEM
        } 
        else if (platform === 'HIVE') {
            logo.src = 'assets/logo_hive.png'; // Percorso del logo per HIVE
        } else {
            logo.src = 'assets/logo_tra.png'; // Percorso del logo di default
        }
    }

    createAccountListItem(username) {
        const li = document.createElement('li');
        li.appendChild(this.createContainer(username));
        document.getElementById('accountList').appendChild(li);

        const url = Url_parameters()
        const params = new URLSearchParams(url.search);
        const platform = params.get('platform')
        if (!platform) {
            platform = localStorage.getItem('platform');
            window.location.search = `platform=${platform}`
        }
    }

    createContainer(username) {
        const container = document.createElement('div');
        container.classList.add('container-username');
        container.appendChild(this.createImageNameContainer(username));
        container.appendChild(this.createButtonsContainer(username));

        container.onclick = () => {
            this.selectAccount(username, container);
        };
        
        return container;
    }

    createImageNameContainer(username) {
        const imgNameContainer = document.createElement('div');
        imgNameContainer.style.display = 'flex';
        imgNameContainer.style.flexDirection = 'row';
        imgNameContainer.style.alignItems = 'center';

        const img = this.createProfileImage(username);
        const spanUsername = this.createUsernameElement(username);

        imgNameContainer.appendChild(img);
        imgNameContainer.appendChild(spanUsername);
        return imgNameContainer;
    }

    createProfileImage(username) {
        const img = document.createElement('img');
        img.alt = `${username.username}'s profile image`;
        img.classList.add('profile-image-thumbnail');
        img.src = username.profile_image || 'https://fonts.gstatic.com/s/i/materialiconsoutlined/account_circle/v6/24px.svg';
        return img;
    }

    createUsernameElement(username) {
        const span = document.createElement('span');
        span.innerText = username.username;
        span.classList.add('usernameElement');
        return span;
    }

    createButtonsContainer(username) {
        const buttonsContainer = document.createElement('div');
        buttonsContainer.classList.add('buttons-container');
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.flexDirection = 'row';
        buttonsContainer.style.flexWrap = 'nowrap';
        buttonsContainer.style.justifyContent = 'flex-end';
        buttonsContainer.style.alignItems = 'baseline';

        const logoutButton = this.createLogoutButton(username);
        buttonsContainer.appendChild(logoutButton);
        return buttonsContainer;
    }

    createLogoutButton(username) {
        const logoutButton = document.createElement('button');
        logoutButton.classList.add('action-btn');
        logoutButton.innerText = 'Logout';
        logoutButton.onclick = () => this.handleLogout(username.username);
        return logoutButton;
    }

    selectAccount(username, containerElement) {
        window.usernameSelected = username;
        document.querySelectorAll('.container-username').forEach(el => el.classList.remove('selected'));
        containerElement.classList.add('selected');

        displayResult({ message: `${t('account_selected')} ${username.username}` }, 'success');
        getUserDrafts();
        applySavedTheme();
        setUsernameForImageUpload(username.username, localStorage.getItem('idTelegram'));
    }

    async handleLogout(username) {
        const dialog = this.createLogoutDialog();
        document.body.appendChild(dialog);
        dialog.showModal();

        const confirmButton = dialog.querySelector('#confirmButtonLogout');
        const cancelButton = dialog.querySelector('#cancelButtonLogout');
        
        const closeDialog = () => dialog.remove();
        const handleConfirmLogout = async () => {
            closeDialog();
            await this.performLogout(username);
        };

        confirmButton.addEventListener('click', handleConfirmLogout);
        cancelButton.addEventListener('click', closeDialog);
        dialog.addEventListener('close', closeDialog);        
    }

    createLogoutDialog() {
        const dialog = document.createElement('dialog');
        dialog.classList.add('dialog');
        dialog.innerHTML = `
            <h2>${t('confirm_logout')}</h2>
            <p>${t('logout_question')}</p>
            <button id="confirmButtonLogout" class="action-btn">${t('dialog_confirm')}</button>
            <button id="cancelButtonLogout" class="action-btn">${t('dialog_cancel')}</button>
        `;
        return dialog;
    }

    async performLogout(username) {
        try {
            const id = localStorage.getItem('idTelegram');
            //starta lo spinner
            document.getElementById('spinner').classList.remove('hide');
            await this.apiClient.logout(id, username);
            await this.handlePostLogout(id).then(() => {
                document.getElementById('spinner').classList.add('hide');
                //svuoti il campo usernameSelected e l'altro campo
                
            });
            displayResult({ message: `${t('logout_successful')}` }, 'success');
        } catch (error) {
            console.error('Error in handleLogout:', error);
            displayResult({ error: error.message }, 'error');
        }
    }

    async handlePostLogout(id) {
        try {
            const result = await this.apiClient.checkLogin(id);
            if (!result.usernames) {
                document.getElementById('draftBtn').disabled = true;
                document.getElementById('postBtn').disabled = true;
                document.getElementById('accountBtn').disabled = true;
                document.getElementById('configBtn').disabled = true;
                window.location.reload(); 
                return;
            }
            appInitializerInstance.setUsernames(result.usernames);
            appInitializerInstance.initializeEnd(result);
        } catch (error) {
            console.error('Error in handlePostLogout:', error);
            displayResult({ error: error.message }, 'error');
            appInitializerInstance.initializeApp();
        } finally {
            document.getElementById('spinner').classList.add('hide');
        }
    }

}

