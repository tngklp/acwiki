// Cache configuration
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

// Cache keys for different data types
const CACHE_KEYS = {
    UNITS: 'units_data_cache',
    TRAITS: 'traits_data_cache',
    ITEMS: 'items_data_cache',
    TIERLIST: 'tierlist_data_cache',
    CODES: 'codes_data_cache'
};

// Function to preload images
function preloadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject(url);
        img.src = url;
    });
}

// Function to preload multiple images
async function preloadImages(urls) {
    const imagePromises = urls.map(url => 
        preloadImage(url)
            .catch(url => console.warn(`Failed to preload image: ${url}`))
    );
    await Promise.allSettled(imagePromises);
}

// Function to check if cache is valid
function isCacheValid(cachedData) {
    return cachedData && 
           cachedData.timestamp && 
           (Date.now() - cachedData.timestamp) < CACHE_DURATION;
}

// Generic data loading function with caching
async function loadData(cacheKey, dataUrl, imageUrlsExtractor = null, bypassCache = false) {
    try {
        // Try to get data from cache first (unless bypassing cache)
        let data;
        const cachedData = !bypassCache ? JSON.parse(localStorage.getItem(cacheKey) || 'null') : null;
        
        if (!bypassCache && isCacheValid(cachedData)) {
            data = cachedData.data;
        } else {
            // Fetch fresh data if cache is invalid, missing, or bypassing cache
            const response = await fetch(dataUrl, bypassCache ? {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            } : {});
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const text = await response.text();
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('JSON Parse Error:', e);
                console.log('Raw response:', text);
                throw new Error('Failed to parse JSON response');
            }
            
            // Update cache with new data and timestamp
            localStorage.setItem(cacheKey, JSON.stringify({
                data: data,
                timestamp: Date.now()
            }));
        }

        // If image URL extractor is provided, preload images
        if (imageUrlsExtractor && typeof imageUrlsExtractor === 'function') {
            const imageUrls = imageUrlsExtractor(data);
            await preloadImages(imageUrls);
        }

        return data;
    } catch (error) {
        console.error(`Error loading data for ${cacheKey}:`, error);
        throw error;
    }
}

// Generic error handler for table display
function displayTableError(tableBody, colspan = 5) {
    tableBody.innerHTML = `
        <tr>
            <td colspan="${colspan}" style="text-align: center; color: #ff4444;">
                Error loading data. Please try again later.
            </td>
        </tr>
    `;
}

// Function to add preload link to head
function addPreloadLink(href, as = 'fetch') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (as === 'fetch') {
        link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
}

// Function to ensure script is loaded
function ensureScriptLoaded(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}