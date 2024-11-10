const platform = localStorage.getItem('platform');

export function showPage(pageId) {
    if (platform === 'STEEM') {
        document.getElementById('steemlogin').style.display = 'block';
        document.getElementById('hivelogin').style.display = 'none';
    }
    else {
        document.getElementById('steemlogin').style.display = 'none';
        document.getElementById('hivelogin').style.display = 'block';
    }
    const modal = document.getElementById('previewModal');
    modal.style.display = 'none';
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

