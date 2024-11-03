export function showPage(pageId) {
    const modal = document.getElementById('previewModal');
    modal.style.display = 'none';
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    if (pageId === 'loginPage' && localStorage.getItem('platform') === 'HIVE') {
        const steemLoginElement = document.getElementById('steemLogin');
        if (steemLoginElement) {
            steemLoginElement.remove();
        }
    }

}
