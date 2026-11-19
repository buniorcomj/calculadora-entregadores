const menuButton = document.querySelector('.menu-toggle');
const compactMenu = window.matchMedia('(max-width: 740px)');

if (menuButton) {
  const menu = document.getElementById(menuButton.getAttribute('aria-controls'));
  const menuLabel = menuButton.querySelector('.menu-label');

  function setMenuOpen(open) {
    menu.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menuLabel.textContent = open ? 'Fechar' : 'Menu';
  }

  menuButton.closest('.header-inner').classList.add('menu-ready');
  menuButton.addEventListener('click', () => {
    setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
  });
  menu.addEventListener('click', (event) => {
    if (compactMenu.matches && event.target.closest('a')) {
      setMenuOpen(false);
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && compactMenu.matches && menu.classList.contains('is-open')) {
      setMenuOpen(false);
      menuButton.focus();
    }
  });
  compactMenu.addEventListener('change', () => setMenuOpen(false));
}
