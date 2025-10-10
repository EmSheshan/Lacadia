// darkMode.js

function setDarkModeFromStorage(buttonSelector = '.toggle-dark-mode') {
  const button = document.querySelector(buttonSelector);
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    if (button) button.innerHTML = '<i class="fas fa-moon"></i>';
    changeFavicon("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌌</text></svg>");
  } else {
    document.body.classList.remove('dark-mode');
    if (button) button.innerHTML = '<i class="fas fa-sun"></i>';
    changeFavicon("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌱</text></svg>");
  }
}

function toggleDarkMode(buttonSelector = '.toggle-dark-mode') {
  // Enable dark mode transition for this and future toggles
  document.documentElement.classList.add('enable-dark-transition');
  const body = document.body;
  const button = document.querySelector(buttonSelector);
  body.classList.toggle('dark-mode');
  if (body.classList.contains('dark-mode')) {
    if (button) button.innerHTML = '<i class="fas fa-moon"></i>';
    changeFavicon("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌌</text></svg>");
    localStorage.setItem('darkMode', 'enabled');
  } else {
    if (button) button.innerHTML = '<i class="fas fa-sun"></i>';
    changeFavicon("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌱</text></svg>");
    localStorage.setItem('darkMode', 'disabled');
  }
}

function changeFavicon(src) {
  const link = document.createElement('link');
  const oldLink = document.getElementById('dynamic-favicon');
  link.id = 'dynamic-favicon';
  link.rel = 'icon';
  link.href = src;
  if (oldLink) {
    document.head.removeChild(oldLink);
  }
  document.head.appendChild(link);
}

window.toggleDarkMode = toggleDarkMode;
window.setDarkModeFromStorage = setDarkModeFromStorage;
