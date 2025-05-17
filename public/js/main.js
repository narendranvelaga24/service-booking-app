document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Accessibility: Add class to body when user starts tabbing for focus styling
    document.body.addEventListener('mousedown', () => {
        document.body.classList.remove('user-is-tabbing');
    });
    document.body.addEventListener('keydown', (event) => {
        if (event.key === 'Tab') {
            document.body.classList.add('user-is-tabbing');
        }
    });

    // Active navigation link highlighting (simple version)
    const navLinks = document.querySelectorAll('header nav ul li a');
    const currentPath = window.location.pathname;

    navLinks.forEach(link => {
        // Handle root path and other paths
        if (link.getAttribute('href') === '/' && currentPath === '/') {
            link.classList.add('active');
        } else if (link.getAttribute('href') !== '/' && currentPath.startsWith(link.getAttribute('href'))) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    console.log('Main client-side JavaScript loaded.');
});
