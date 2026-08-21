// This runs as soon as the file is loaded
console.log("Schoology clone loaded successfully!");

// Find all HTML elements with the class 'course-card'
const courseCards = document.querySelectorAll('.course-card');

// Loop through each card and add a click event
courseCards.forEach(card => {
    card.addEventListener('click', () => {
        // Find the title (h3) inside the specific card that was clicked
        const courseTitle = card.querySelector('h3').innerText;
        
        // Trigger a browser alert
        alert(`Navigating to: ${courseTitle}`);
    });
});
