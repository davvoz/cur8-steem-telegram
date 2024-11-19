import { displayResult } from '../components/dialog.js';
export class ApiClient {
    constructor() {
        this.apiKey = 'your_secret_api_key';
        //const startParam = localStorage.getItem('platform');
        //il nostro url è questo https://192.168.1.46:8093/?platform=STEEM#/
        //oppure questo https://192.168.1.46:8093/?platform=STEEM?access_token=eyJzaWduZWRfbWVzc2FnZSI6eyJ0eXBlIjoicG9zdGluZyIsImFwcCI6ImN1cjgifSwiYXV0aG9ycyI6WyJob2wueWVzIl0sInRpbWVzdGFtcCI6MTczMjA1Njc1Mywic2lnbmF0dXJlcyI6WyIxZjQ4YjI2MTE3MDgzNmE2YzVkNWUwNDA5M2Y2YzM3ZTRiODYxNWI1NTdiZDUzMTNlOWE2YjUxZTYxMDU0N2IzZmEwOGU1NGEyNDFlYWM1Y2E4ZTQ4MDNiOWVkZmNhMDQ0ZjAzMTg2ZjNhMjBlODU2ZWQwYmMxODc5YzRmMTRmMzAyIl19&username=hol.yes&expires_in=604800&state=zez8k#/
        console.log(window.location.href);
        let startParam;
        try {
            startParam = window.location.href.split('?')[1].split('#')[0].split('=')[1];
        } catch (error) {
            startParam = null;
        }
        //cerchiamo nel localStorage platform
        //console.log(platform);
        const platform = localStorage.getItem('platform');
        
        console.log(startParam);
        if  (!startParam) {
            //cerchiamo nel sessionStorage steemlogin
            const isPresent = sessionStorage.getItem('steemLoginState') ;
            if (isPresent) {
                startParam = 'STEEM';
                //svuotiamo il sessionStorage
                sessionStorage.removeItem('steemLoginState');
                //riempiamo il localStorage
                localStorage.setItem('platform', startParam);
            } else {
                startParam = null;
            }
        }

        const baseUrlMap = {
            'STEEM': 'https://develop-imridd.eu.pythonanywhere.com/api/steem',
            'HIVE': 'https://develop-imridd.eu.pythonanywhere.com/api/hive'
        };
        const secureStartParam = // eliminiamo tutto quello che c'è dopo il primo ?
            startParam.split('?')[0];
        this.baseUrl = baseUrlMap[startParam] || (() => {
            console.error('Invalid start parameter:',secureStartParam );
            displayResult(
                { error: 'Invalid start parameter, please reload the page' },
                'error',
                true
            );
            return null;
        })();

        if (!this.baseUrl) {
            displayResult(
                { error: 'Error during initialization, please reload the page' },
                'error',
                true
            );
        }
    }

    async sendRequest(endpoint, method, data = null) {
        const telegramData = {
            'id': window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'default_id',
            'first_name': window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || 'default_first_name',
            'username': window.Telegram?.WebApp?.initDataUnsafe?.user?.username || 'default_username',
            'auth_date': window.Telegram?.WebApp?.initDataUnsafe?.auth_date || 'default_auth_date',
            'hash': window.Telegram?.WebApp?.initDataUnsafe?.hash || 'default_hash'
        };

        const idTelegram = localStorage.getItem('idTelegram');
        const url = `${this.baseUrl}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'API-Key': this.apiKey,
                'Id-Telegram': idTelegram,
                'Telegram-Data': window.Telegram?.WebApp?.initData,
            },
            body: data ? JSON.stringify(data) : null
        };

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    login(idTelegram, username, postingKey) {
        return this.sendRequest('/login', 'POST', { id_telegram: idTelegram, username, posting_key: postingKey });
    }

    logout(idTelegram, username) {
        return this.sendRequest('/logout', 'POST', { id_telegram: idTelegram, username });
    }

    saveDraft(username, title, tags, body, scheduledTime, timezone, community) {
        return this.sendRequest('/save_draft', 'POST', { username, title, tags, body, scheduled_time: scheduledTime, timezone, community });
    }

    getUserDrafts(username) {
        return this.sendRequest(`/get_user_drafts?username=${username}`, 'GET');
    }

    deleteDraft(id, username) {
        return this.sendRequest('/delete_draft', 'DELETE', { id, username });
    }

    postToSteem(username, title, body, tags, community) {
        console.log('Posting to Steem:', username, title, body, tags, community);
        return this.sendRequest('/post', 'POST', { username, title, body, tags, community });
    }

    createAccount(username, postingKey) {
        return this.sendRequest('/create_account', 'POST', { username, posting_key: postingKey });
    }

    readAccount(username) {
        return this.sendRequest(`/read_account?username=${username}`, 'GET');
    }

    updateAccount(username, postingKey) {
        return this.sendRequest('/update_account', 'PUT', { username, posting_key: postingKey });
    }

    deleteAccount(username) {
        return this.sendRequest('/delete_account', 'DELETE', { username });
    }

    checkLogin(idTelegram) {
        return this.sendRequest('/check_login', 'POST', { id_telegram: idTelegram });
    }

    listaComunities() {
        return this.sendRequest('/communities', 'GET');
    }

}