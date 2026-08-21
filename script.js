document.addEventListener('DOMContentLoaded', () => {
    
    const postBtn = document.getElementById('postBtn');
    const updateInput = document.getElementById('updateInput');
    const postBox = document.querySelector('.post-box');

    postBtn.addEventListener('click', () => {
        // Grab the text and remove extra whitespace
        const content = updateInput.value.trim();
        
        // If the box is empty, don't do anything
        if (!content) return; 

        // Get the current time for the timestamp
        const now = new Date();
        const timeString = `Today at ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;

        // Create a new div element for the feed card
        const newCard = document.createElement('div');
        newCard.classList.add('feed-card');
        
        // Build the HTML structure inside the new card
        newCard.innerHTML = `
            <div class="feed-header">
                <div class="profile-pic"></div>
                <div>
                    <div class="feed-title">Caleb > Information Technology</div>
                    <div class="feed-time">${timeString}</div>
                </div>
            </div>
            <div class="feed-content">
                <p>${content}</p>
            </div>
        `;

        // Insert the new card directly after the post box
        postBox.insertAdjacentElement('afterend', newCard);

        // Clear the text area
        updateInput.value = '';
    });
});
