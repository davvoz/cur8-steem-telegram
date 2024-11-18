export function showPage(pageId) {
    let url_string = window.location.href
    let questionMarkCount = 0;
    let modified_url = url_string.replace(/\?/g, function(match) {
        questionMarkCount++;
        return questionMarkCount === 2 ? '&' : match;
    });
    const url = new URL(modified_url);
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

