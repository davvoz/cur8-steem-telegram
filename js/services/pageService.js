import { Url_parameters } from './parameters.js';

export function showPage(pageId) {
    const url = Url_parameters()
    const params = new URLSearchParams(url.search);
    const platform = params.get('platform');

    const modal = document.getElementById('previewModal');
    modal.style.display = 'none';
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    if (platform === 'STEEM') {
        document.getElementById('steemlogin').style.display = 'block'; 
    }
    if (platform === 'HIVE') {
        document.getElementById('hivelogin').style.display = 'block';
    }
}

