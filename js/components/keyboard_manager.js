export function setupKeyboardHandling() {
    const inputs = document.querySelectorAll('input');
    const keyboardDismissBtn = document.getElementById('keyboardDismiss');
    
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        if (window.innerWidth <= 768) {
          keyboardDismissBtn.classList.add('show');
        }
      });
  
      input.addEventListener('blur', () => {
        keyboardDismissBtn.classList.remove('show');
      });
    });
  
    keyboardDismissBtn.addEventListener('click', () => {
      document.activeElement.blur();
      keyboardDismissBtn.classList.remove('show');
    });
  
    document.addEventListener('touchend', (e) => {
      const activeElement = document.activeElement;
      if (activeElement && activeElement.tagName === 'INPUT' && !activeElement.contains(e.target)) {
        activeElement.blur();
      }
    });
  }