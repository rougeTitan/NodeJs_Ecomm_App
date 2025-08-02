// Client-side JavaScript for mobile navigation functionality

// Get DOM elements for mobile navigation
const backdrop = document.querySelector('.backdrop'); // Dark overlay behind mobile menu
const sideDrawer = document.querySelector('.mobile-nav'); // Mobile navigation drawer
const menuToggle = document.querySelector('#side-menu-toggle'); // Hamburger menu button

// Function to handle backdrop click - closes mobile navigation
function backdropClickHandler() {
  backdrop.style.display = 'none'; // Hide backdrop overlay
  sideDrawer.classList.remove('open'); // Close side drawer by removing 'open' class
}

// Function to handle menu toggle click - opens mobile navigation
function menuToggleClickHandler() {
  backdrop.style.display = 'block'; // Show backdrop overlay
  sideDrawer.classList.add('open'); // Open side drawer by adding 'open' class
}

// Add event listeners for mobile navigation interactions
backdrop.addEventListener('click', backdropClickHandler); // Close menu when backdrop is clicked
menuToggle.addEventListener('click', menuToggleClickHandler); // Open menu when toggle button is clicked
