export function getUsername() {
    if (typeof window.usernameSelected.username === 'undefined') {
        return usernames[0].username;
    }
    return window.usernameSelected.username;
}