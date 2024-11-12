const platform = localStorage.getItem('platform');

export function showPage(pageId) {
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

