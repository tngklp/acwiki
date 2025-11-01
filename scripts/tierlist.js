// Configuration object for UI elements
const UI_CONFIG = {
    sections: {
        baseStats: {
            enabled: false, // Set to true to re-enable the base stats section
        }
    }
};

// Function to initialize UI configuration
function initializeUIConfig() {
    // Base Stats Section
    const statsSection = document.getElementById('statsSection');
    if (statsSection) {
        statsSection.style.display = UI_CONFIG.sections.baseStats.enabled ? 'block' : 'none';
    }
}

// Initialize UI configuration when the document is ready
document.addEventListener('DOMContentLoaded', initializeUIConfig);