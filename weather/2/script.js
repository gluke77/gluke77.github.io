const europeanCapitals = [
  "Amsterdam", "Athens", "Berlin", "Bern", "Brussels", "Budapest",
  "Copenhagen", "Dublin", "Helsinki", "Kyiv", "Lisbon", "Ljubljana",
  "London", "Madrid", "Minsk", "Monaco", "Moscow", "Nicosia", "Oslo",
  "Paris", "Prague", "Reykjavik", "Riga", "Rome", "Sofia", "Stockholm",
  "Tallinn", "Tirana", "Vienna", "Vilnius", "Warsaw", "Zagreb"
];

const citySelect = document.getElementById('citySelect');
const getWeatherBtn = document.getElementById('getWeatherBtn');
const clearWeatherBtn = document.getElementById('clearWeatherBtn');
const weatherDisplay = document.getElementById('weatherDisplay');
const loadingSpinner = document.getElementById('loadingSpinner');
const messageBox = document.getElementById('messageBox');
const messageText = document.getElementById('messageText');

function showMessage(message, type = 'info') {
  messageText.textContent = message;
  messageBox.className = 'mt-4 p-3 border rounded-lg';
  const typeClasses = {
    success: 'bg-green-100 border-green-400 text-green-700',
    error: 'bg-red-100 border-red-400 text-red-700',
    info: 'bg-blue-100 border-blue-400 text-blue-700'
  };
  messageBox.classList.add(...typeClasses[type].split(' '));
  messageBox.classList.remove('hidden');
}

function hideMessage() {
  messageBox.classList.add('hidden');
  messageText.textContent = '';
}

function populateCityDropdown() {
  europeanCapitals.forEach(capital => {
    const option = document.createElement('option');
    option.value = capital;
    option.textContent = capital;
    citySelect.appendChild(option);
  });
}

async function fetchWeatherData() {
  const selectedCity = citySelect.value;
  if (!selectedCity) {
    showMessage("Please select a city.", "error");
    return;
  }

  weatherDisplay.innerHTML = '<p class="text-gray-500">Fetching weather data...</p>';
  hideMessage();
  loadingSpinner.style.display = 'block';
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
    console.error("Error fetching weather data:", error);
    let errorMessage = `Failed to retrieve weather for ${selectedCity}.`;
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      errorMessage += ` This might be due to network or CORS issues.`;
    }
    weatherDisplay.innerHTML = `
      <div class="text-center">
        <p class="text-red-600 font-semibold mb-2">${errorMessage}</p>
        <p class="text-red-500 text-sm">Please check your internet connection or try again later.</p>
      </div>
    `;
    showMessage(errorMessage, "error");
  } finally {
    loadingSpinner.style.display = 'none';
    getWeatherBtn.disabled = false;
    clearWeatherBtn.disabled = false;
  }
}

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
        <div class="bg-blue-100 p-3 rounded-lg border border-blue-300 shadow-sm">
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

function clearWeatherDisplay() {
  weatherDisplay.innerHTML = '<p class="text-gray-500">Select a city and click "Get Weather" to see the forecast.</p>';
  hideMessage();
  showMessage("Weather display cleared.", "info");
}

getWeatherBtn.addEventListener('click', fetchWeatherData);
clearWeatherBtn.addEventListener('click', clearWeatherDisplay);

document.addEventListener('DOMContentLoaded', () => {
  populateCityDropdown();
  citySelect.value = "London";
});

