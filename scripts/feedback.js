document.addEventListener('DOMContentLoaded', () => {
    // Cooldown duration in milliseconds (5 minutes)
    const COOLDOWN_DURATION = 1 * 60 * 1000;

    // Check if user is in cooldown
    function isInCooldown() {
        const lastSubmission = localStorage.getItem('lastFeedbackSubmission');
        if (!lastSubmission) return false;

        const timeSinceLastSubmission = Date.now() - parseInt(lastSubmission);
        return timeSinceLastSubmission < COOLDOWN_DURATION;
    }

    // Get remaining cooldown time in seconds
    function getRemainingCooldown() {
        const lastSubmission = localStorage.getItem('lastFeedbackSubmission');
        if (!lastSubmission) return 0;

        const timeSinceLastSubmission = Date.now() - parseInt(lastSubmission);
        const remainingTime = Math.ceil((COOLDOWN_DURATION - timeSinceLastSubmission) / 1000);
        return Math.max(0, remainingTime);
    }

    // Update submit button state based on cooldown
    function updateSubmitButtonState() {
        const submitButton = document.getElementById('submitButton');
        const submitStatus = document.getElementById('submitStatus');
        
        if (isInCooldown()) {
            const remainingSeconds = getRemainingCooldown();
            const minutes = Math.floor(remainingSeconds / 60);
            const seconds = remainingSeconds % 60;
            submitButton.disabled = true;
            submitStatus.className = 'submit-status warning';
            submitStatus.textContent = `Please wait ${minutes}:${seconds.toString().padStart(2, '0')} before submitting again`;
        } else {
            submitButton.disabled = false;
            submitStatus.textContent = '';
            submitStatus.className = 'submit-status';
        }
    }

    // Update cooldown timer every second
    setInterval(updateSubmitButtonState, 1000);
    updateSubmitButtonState();

    // Discord webhook URLs for different categories
    const WEBHOOK_URLS = {
        'Bug Report': 'https://discord.com/api/webhooks/1433571496462385195/QlKnrmK9REnYkeCb2PgvP_1VU8oNaT05ZlmJ3wDk99Plsn_cBbIFwxB5RrG0IBqnhEsP',
        'Suggestion': 'https://discord.com/api/webhooks/1433571643506163834/bzFGRomVd4W5GznAu8JlTPp0iOfdUsTBNXWVEQdmQQuZqrPXzkdcfnwOK7zFGxww-a8d',
        'Content Issue': 'https://discord.com/api/webhooks/1433571731355730061/5k9wN3Iw-uz7e0XPMdsXMfQUJqXY9D_xa5wJSWsLh0pCCM5e1W2XHUHTAcwfhKIjPKXd',
        'Other': 'https://discord.com/api/webhooks/1433571821818482790/rR4iuscEl2jvI3XUYTg2-yAGBdpbzV-HH7eXx7r9somGPNJXnAbHvGRZieGcO9GQ_HTQ'
    };

    const form = document.getElementById('feedbackForm');
    const submitButton = document.getElementById('submitButton');
    const submitStatus = document.getElementById('submitStatus');
    const description = document.getElementById('description');
    const charCount = document.getElementById('charCount');

    // Update character count
    description.addEventListener('input', () => {
        const count = description.value.length;
        charCount.textContent = count;
        
        if (count >= 1900) {
            charCount.style.color = '#e74c3c';
        } else if (count >= 1500) {
            charCount.style.color = '#f1c40f';
        } else {
            charCount.style.color = '#808080';
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitButton.disabled = true;
        submitStatus.className = 'submit-status';
        submitStatus.textContent = 'Submitting feedback...';

        // Get form data
        const formData = {
            category: document.getElementById('category').value,
            subject: document.getElementById('subject').value,
            description: description.value,
            discord: document.getElementById('discord').value || null
        };

        try {
            // Get the appropriate webhook URL based on the category
            const webhookUrl = WEBHOOK_URLS[formData.category];

            // Create Discord embed
            const embed = {
                title: '📝 New Feedback Submission',
                color: 0xb794f6,
                fields: [
                    {
                        name: 'Subject',
                        value: formData.subject
                    },
                    {
                        name: 'Description',
                        value: formData.description.length > 1024 
                            ? formData.description.substring(0, 1021) + '...'
                            : formData.description
                    }
                ],
                timestamp: new Date().toISOString()
            };

            if (formData.discord != null) {
                embed.footer = { text: `Submitted by ${formData.discord}` };
            } else {
                embed.footer = { text: `Submitted by Anonymous` };
            }

            // Send to Discord webhook
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    embeds: [embed]
                })
            });

            if (!response.ok) {
                throw new Error('Failed to submit feedback');
            }

            // Show success message and start cooldown
            submitStatus.className = 'submit-status success';
            submitStatus.textContent = 'Feedback submitted successfully! Thank you for your input.';
            form.reset();
            charCount.textContent = '0';
            localStorage.setItem('lastFeedbackSubmission', Date.now().toString());
            updateSubmitButtonState();

        } catch (error) {
            console.error('Error submitting feedback:', error);
            submitStatus.className = 'submit-status error';
            submitStatus.textContent = 'Error submitting feedback. Please try again later.';
        }

        submitButton.disabled = false;
    });
});