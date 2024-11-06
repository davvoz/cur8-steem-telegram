const platform = localStorage.getItem('platform');

export function showPage(pageId) {
    if (platform === 'STEEM') {
        document.getElementById('steemlogin').style.display = 'block';
    }
    const modal = document.getElementById('previewModal');
    modal.style.display = 'none';
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

