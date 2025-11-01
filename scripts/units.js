// Configuration object for UI elements
const UI_CONFIG = {
    sections: {
        baseStats: {
            enabled: false, // Set to true to re-enable the base stats section
        }
    }
};

// Function to determine if a unit is a base version
function isBaseUnit(unitId) {
    return !unitId.endsWith('_evo') && allUnits.some(unit => unit.id === `${unitId}_evo`);
}

// Function to filter units based on all active criteria
function filterUnits(searchTerm) {
    if (!allUnits || !Array.isArray(allUnits)) {
        console.error('Units array is not properly initialized:', allUnits);
        return [];
    }

    let filteredUnits = [...allUnits];

    // Filter base units if toggle is off
    if (!showBaseUnits) {
        filteredUnits = filteredUnits.filter(unit => !isBaseUnit(unit.id));
    }

    // Apply search filter
    if (searchTerm) {
        searchTerm = searchTerm.toLowerCase();
        filteredUnits = filteredUnits.filter(unit => {
            // Check the main name
            if (unit.name.toLowerCase().includes(searchTerm)) {
                return true;
            }
            // Check alternatives if they exist
            if (unit.alternatives && Array.isArray(unit.alternatives)) {
                return unit.alternatives.some(alt => alt.toLowerCase().includes(searchTerm));
            }
            return false;
        });
    }

    // Apply rarity filters
    if (activeFilters.rarity.size > 0) {
        filteredUnits = filteredUnits.filter(unit => activeFilters.rarity.has(unit.rarity));
    }

    // Apply attribute filters
    if (activeFilters.attribute.size > 0) {
        filteredUnits = filteredUnits.filter(unit => 
            Array.from(activeFilters.attribute).some(attr => unit.attributes.includes(attr))
        );
    }

    // Apply damage type filters
    if (activeFilters.damage.size > 0) {
        filteredUnits = filteredUnits.filter(unit => 
            unit.damage_type.some(type => activeFilters.damage.has(type))
        );
    }

    // Apply element filters
    if (activeFilters.element.size > 0) {
        filteredUnits = filteredUnits.filter(unit => {
            if (!unit.elements) return false;
            if (matchAllElements) {
                // Unit must have all selected elements
                return Array.from(activeFilters.element).every(element => 
                    unit.elements.includes(element)
                );
            } else {
                // Unit must have at least one of the selected elements
                return unit.elements.some(element => 
                    activeFilters.element.has(element)
                );
            }
        });
    }
    
    return filteredUnits;
}

// Function to initialize UI configuration and event listeners
function initializeUIConfig() {
    // Base Stats Section
    const statsSection = document.getElementById('statsSection');
    if (statsSection) {
        statsSection.style.display = UI_CONFIG.sections.baseStats.enabled ? 'block' : 'none';
    }

    // Initialize base units toggle button
    const toggleUnevoBtn = document.getElementById('toggleUnevo');
    if (toggleUnevoBtn) {
        toggleUnevoBtn.addEventListener('click', () => {
            showBaseUnits = !showBaseUnits;
            toggleUnevoBtn.classList.toggle('active');
            // Update button text
            toggleUnevoBtn.textContent = showBaseUnits ? 'Hide Base Units' : 'Show Base Units';
            // Re-apply filters and update display
            const searchTerm = document.getElementById('unitSearch').value;
            const filteredUnits = filterUnits(searchTerm);
            displayUnits(filteredUnits);
        });
    }
}

// Initialize UI configuration when the document is ready
document.addEventListener('DOMContentLoaded', initializeUIConfig);