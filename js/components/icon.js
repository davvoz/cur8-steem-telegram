export function createIconButton(iconName, onClick) {
    const button = document.createElement('button');
    const icon = document.createElement('i');
    icon.classList.add('material-icons');
    icon.innerText = iconName;
    button.appendChild(icon);
    button.classList.add('action-btn-mini');
    button.onclick = (event) => {
        event.stopPropagation(); 
        onClick();
    };
    return button;
}