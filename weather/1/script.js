// Array of European capitals
const europeanCapitals = [
    "Amsterdam", "Athens", "Berlin", "Bern", "Brussels", "Budapest",
    "Copenhagen", "Dublin", "Helsinki", "Kyiv", "Lisbon", "Ljubljana",
    "London", "Madrid", "Minsk", "Monaco", "Moscow", "Nicosia", "Oslo",
    "Paris", "Prague", "Reykjavik", "Riga", "Rome", "Sofia", "Stockholm",
    "Tallinn", "Tirana", "Vienna", "Vilnius", "Warsaw", "Zagreb"
];

// Get DOM elements
const citySelect = document.getElementById('citySelect');
const getWeatherBtn = document.getElementById('getWeatherBtn');
const clearWeatherBtn = document.getElementById('clearWeatherBtn');
const weatherDisplay = document.getElementById('weatherDisplay');
const loadingSpinner = document.getElementById('loadingSpinner');
const messageBox = document.getElementById('messageBox');
const messageText = document.getElementById('messageText');

/**
 * Displays a message in the message box.
 * @param {string} message - The message to display.
 * @param {string} type - 'success' or 'error' for styling.
 */
function showMessage(message, type = 'info') {
    messageText.textContent = message;
    messageBox.classList.remove('hidden', 'bg-red-100', 'border-red-400', 'text-red-700', 'bg-green-100', 'border-green-400', 'text-green-700', 'bg-blue-100', 'border-blue-400', 'text-blue-700');
    if (type === 'error') {
        messageBox.classList.add('bg-red-100', 'border-red-400', 'text-red-700');
    } else if (type === 'success') {
        messageBox.classList.add('bg-green-100', 'border-green-400', 'text-green-700');
    } else {
        messageBox.classList.add('bg-blue-100', 'border-blue-400', 'text-blue-700');
    }
    messageBox.classList.remove('hidden');
}

/**
 * Hides the message box.
 */
function hideMessage() {
    messageBox.classList.add('hidden');
    messageText.textContent = '';
}

/**
 * Populates the dropdown with European capitals.
 */
function populateCityDropdown() {
    europeanCapitals.forEach(capital => {
        const option = document.createElement('option');
        option.value = capital;
        option.textContent = capital;
        citySelect.appendChild(option);
    });
}

/**
 * Fetches weather data for the selected city and displays it.
 */
async function fetchWeatherData() {
    const selectedCity = citySelect.value;
    if (!selectedCity) {
        showMessage("Please select a city.", "error");
        return;
    }

    // Clear previous weather display and message
    weatherDisplay.innerHTML = '<p class="text-gray-500">Fetching weather data...</p>';
    hideMessage();
    loadingSpinner.style.display = 'block'; // Show loading spinner
    getWeatherBtn.disabled = true;
    clearWeatherBtn.disabled = true;

    try {
        const response = await fetch(`http://goweather.xyz/weather/${selectedCity}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        displayWeather(data, selectedCity);
    } catch (error) {
        console.error("Error fetching weather data:", error); // Log the full error object
        let errorMessage = `Failed to retrieve weather for ${selectedCity}.`;
        // Check if the error object has a name or message that suggests network/CORS
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            errorMessage += ` This often happens due to network issues or Cross-Origin Resource Sharing (CORS) policies.`;
        } else if (error.message.includes("Load failed")) { // Catching the specific message
            errorMessage += ` This often happens due to network issues or Cross-Origin Resource Sharing (CORS) policies.`;
        }

        weatherDisplay.innerHTML = `
            <div class="text-center">
                <p class="text-red-600 font-semibold mb-2">${errorMessage}</p>
                <p class="text-red-500 text-sm">Please check your internet connection or try again later.</p>
            </div>
        `;
        showMessage(errorMessage, "error");
    } finally {
        loadingSpinner.style.display = 'none'; // Hide loading spinner
        getWeatherBtn.disabled = false;
        clearWeatherBtn.disabled = false;
    }
}

/**
 * Displays the weather data in a nicely formatted way.
 * @param {object} weatherData - The weather data object from the API.
 * @param {string} city - The name of the city.
 */
function displayWeather(weatherData, city) {
    if (!weatherData || !weatherData.temperature) {
        weatherDisplay.innerHTML = `
            <div class="text-center">
                <p class="text-yellow-600 font-semibold mb-2">No weather data available for ${city}.</p>
                <p class="text-yellow-500 text-sm">The API might not have information for this city.</p>
            </div>
        `;
        return;
    }

    let forecastHtml = '';
    if (weatherData.forecast && weatherData.forecast.length > 0) {
        forecastHtml = `
            <h3 class="text-xl font-semibold mb-3 text-blue-800">Next 3 Days Forecast:</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
        `;
        weatherData.forecast.forEach(day => {
            forecastHtml += `
                <div class="bg-blue-100 p-3 rounded-lg border border-blue-300 shadow-sm"> <!-- Changed p-4 to p-3 -->
                    <p class="font-medium text-blue-700">Day ${day.day}:</p>
                    <p class="text-blue-600">Temperature: ${day.temperature}</p>
                    <p class="text-blue-600">Wind: ${day.wind}</p>
                </div>
            `;
        });
        forecastHtml += `</div>`;
    } else {
        forecastHtml = `<p class="text-gray-600">No detailed forecast available.</p>`;
    }

    weatherDisplay.innerHTML = `
        <div class="w-full text-left">
            <h2 class="text-2xl font-bold text-blue-700 mb-4 text-center">${city} Weather</h2>
            <div class="bg-blue-100 p-4 rounded-lg mb-4 shadow-sm border border-blue-300">
                <p class="text-lg mb-2"><strong class="text-blue-800">Temperature:</strong> ${weatherData.temperature || 'N/A'}</p>
                <p class="text-lg mb-2"><strong class="text-blue-800">Wind:</strong> ${weatherData.wind || 'N/A'}</p>
                <p class="text-lg"><strong class="text-blue-800">Description:</strong> ${weatherData.description || 'N/A'}</p>
            </div>
            ${forecastHtml}
        </div>
    `;
    showMessage(`Weather data for ${city} loaded successfully!`, "success");
}

/**
 * Clears the weather display and resets the message box.
 */
function clearWeatherDisplay() {
    weatherDisplay.innerHTML = '<p class="text-gray-500">Select a city and click "Get Weather" to see the forecast.</p>';
    hideMessage();
    showMessage("Weather display cleared.", "info");
}

// Event Listeners
getWeatherBtn.addEventListener('click', fetchWeatherData);
clearWeatherBtn.addEventListener('click', clearWeatherDisplay);

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    populateCityDropdown();
    // Select London by default
    citySelect.value = "London";
});

