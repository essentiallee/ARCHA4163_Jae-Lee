document.addEventListener("DOMContentLoaded", function() {
    console.log('JavaScript is now running!');

    // Find HTML elements by their IDs
    const button = document.getElementById('demoButton');
    const messageArea = document.getElementById('messageDisplay');

    // Add a click event listener to the button
    button.addEventListener('click', function() {
        console.log('Button was clicked!');

        // Create a message with current time
        const currentTime = new Date().toLocaleTimeString();
        const message = `Hello! You clicked the button at: ${currentTime}`;
        
        //Display the message in our HTML
        messageArea.textContent = message;

        //Change button text temporarily
        button.textContent = 'Thanks for clicking!';

        // Reset button text after 2 seconds
        setTimeout(funtion() {
            button.textContent = 'Click Me!';
        }, 2000);
    });
});