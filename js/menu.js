document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.menu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', function() {
      // Alterna la clase 'active' en la lista del menú para mostrarlo/ocultarlo
      navMenu.classList.toggle('active');
    });
  }
});