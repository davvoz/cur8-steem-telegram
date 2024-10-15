
export default class ApiClient {
    constructor(baseUrl = 'https://imridd.eu.pythonanywhere.com/api/steem') {
        this.apiKey = 'your_secret_api_key';
        this.baseUrl = baseUrl;
    }

    async sendRequest(endpoint, method, data = null) {   
        const telegramData = {
            'id': window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'default_id',
            'first_name': window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || 'default_first_name',
            'username': window.Telegram?.WebApp?.initDataUnsafe?.user?.username || 'default_username',
            'auth_date': window.Telegram?.WebApp?.initDataUnsafe?.auth_date || 'default_auth_date',
            'hash': window.Telegram?.WebApp?.initDataUnsafe?.hash || 'default_hash'
        };
        
        console.log( JSON.stringify(telegramData));
        const url = `${this.baseUrl}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'API-Key': this.apiKey,
                'Telegram-Data': window.Telegram?.WebApp?.initData
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