import dotenv from 'dotenv';

dotenv.config();
export default class ApiClient {
    constructor(baseUrl = 'https://imridd.eu.pythonanywhere.com/api/steem') {
        this.apiKey =  process.env.API_KEY;
        this.baseUrl = baseUrl;
    }

    async sendRequest(endpoint, method, data = null) {
        const url = `${this.baseUrl}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'API-Key': this.apiKey
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

    saveDraft(username, title, tags, body, scheduledTime, timezone) {
        return this.sendRequest('/save_draft', 'POST', { username, title, tags, body, scheduled_time: scheduledTime, timezone });
    }

    getUserDrafts(username) {
        return this.sendRequest(`/get_user_drafts?username=${username}`, 'GET');
    }

    deleteDraft(id, username) {
        return this.sendRequest('/delete_draft', 'DELETE', { id, username });
    }

    postToSteem(username, title, body, tags) {
        return this.sendRequest('/post', 'POST', { username, title, body, tags });
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