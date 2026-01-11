


document.addEventListener("DOMContentLoaded", () => {

  const weatherForm = document.getElementById("weather-form");
  const cityInput = document.getElementById("city-input");
  const weatherInfo = document.getElementById("weather-info");
  const weatherBox = document.getElementById("weather-box");
  const videoSource = document.getElementById("video-source");
  const bgVideo = document.getElementById("bg-video");
  const unitToggle = document.getElementById("unit-toggle");
  const loader = document.getElementById("initial-load");

  const API_KEY = '5b74e87158f9cad9592fdfeac5683b9f';
  let unit = localStorage.getItem("unit") || "metric";

  unitToggle.textContent = unit === "metric" ? "°F" : "°C";

  initVideo();
  getUserLocation();

  setTimeout(() => loader.style.display = "none", 1200);

  weatherForm.addEventListener("submit", e => {
    e.preventDefault();
    getWeather(cityInput.value.trim());

    cityInput.value = "";
  });

  unitToggle.addEventListener("click", () => {
    unit = unit === "metric" ? "imperial" : "metric";
    localStorage.setItem("unit", unit);
    unitToggle.textContent = unit === "metric" ? "°F" : "°C";
    if (cityInput.value.trim()) getWeather(cityInput.value.trim());
  });

  function initVideo() {
    videoSource.src = "videos/default.mp4";
    bgVideo.load();
  }

  function showLoading(msg) {
    weatherBox.style.display = "block";
    weatherBox.classList.remove("show");
    weatherInfo.innerHTML = `<p>⏳ ${msg}</p>`;
  }

  function showError(msg) {
    weatherInfo.innerHTML = `<p style="color:#ff6b6b">❌ ${msg}</p>`;
  }

  async function getWeather(city) {
    try {
      showLoading(`Fetching weather for ${city}...`);
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${unit}`
      );
      if (!res.ok) throw new Error("City not found");
      const data = await res.json();
      displayWeather(data);
    } catch (err) {
      showError(err.message);
      initVideo();
    }
  }

  async function getWeatherByCoords(lat, lon) {
    try {
      showLoading("Fetching weather for your location...");
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`
      );
      const data = await res.json();
      displayWeather(data);
    } catch {
      showError("Location error");
    }
  }

  function displayWeather(data) {
    const condition = data.weather[0].main.toLowerCase();
    const asset = getWeatherAssets(condition);
    const tempUnit = unit === "metric" ? "°C" : "°F";

    videoSource.src = `videos/${asset.video}`;
    bgVideo.load();

    weatherInfo.innerHTML = `
      <h2>${data.name}, ${data.sys.country}</h2>
      <div style="font-size:3rem">${asset.icon}</div>
      <p class="temperature">${Math.round(data.main.temp)}${tempUnit}</p>
      <p class="conditions">${data.weather[0].description}</p>
      <p>Feels like ${Math.round(data.main.feels_like)}${tempUnit}</p>
      <p>💧 ${data.main.humidity}% | 🌬️ ${data.wind.speed} m/s</p>
    `;

    weatherBox.classList.add("show");
  }

  function getUserLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => getWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
      () => console.log("Location denied")
    );
  }

  function getWeatherAssets(condition) {
    const map = {
      clear: { icon: "☀️", video: "sunny.mp4" },
      clouds: { icon: "☁️", video: "cloudy.mp4" },
      rain: { icon: "🌧️", video: "rainy.mp4" },
      drizzle: { icon: "🌦️", video: "drizzle.mp4" },
      snow: { icon: "❄️", video: "snowy.mp4" },
      thunderstorm: { icon: "⛈️", video: "thunderstorm.mp4" },
      mist: { icon: "🌫️", video: "foggy.mp4" },
      haze: { icon: "🌫️", video: "foggy.mp4" }
    };
    return map[condition] || { icon: "🌤️", video: "default.mp4" };
  }

});

