import { svuotaForm } from '../pages/postPage.js';

export function showPage(pageId) {
    const modal = document.getElementById('previewModal');
    modal.style.display = 'none';
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    if (pageId !== 'postPage') {
        svuotaForm();
    }
}
