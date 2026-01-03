const input = document.getElementById("city");
const suggestionsBox = document.getElementById("suggestions");
const lightning = document.getElementById("lightning");

/* India-only city list */
const indianCities = [
  "Vadodara",
  "Vadodara Airport",
  "Vadodara Rural",
  "Vapi",
  "Ahmedabad",
  "Ahmedabad Airport",
  "Surat",
  "Mumbai",
  "Mumbai Airport",
  "Delhi",
  "Delhi Airport",
  "Pune",
  "Jaipur"
];

/* =======================
   CITY SUGGESTIONS
======================= */
input.addEventListener("input", () => {
  const q = input.value.toLowerCase();
  suggestionsBox.innerHTML = "";

  if (q.length < 2) {
    suggestionsBox.style.display = "none";
    return;
  }

  indianCities
    .filter(city => city.toLowerCase().startsWith(q))
    .forEach(city => {
      const div = document.createElement("div");
      div.textContent = city;
      div.onclick = () => {
        input.value = city;
        suggestionsBox.style.display = "none";
        getWeather();
      };
      suggestionsBox.appendChild(div);
    });

  suggestionsBox.style.display = "block";
});

/* =======================
   AUTO LOCATION
======================= */
window.onload = () => {
  setDayNight();
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      getWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
    });
  }
};

/* =======================
   WEATHER FETCH
======================= */
async function getWeather() {
  let cityName = input.value.trim();

  if (!cityName) {
    showError("Please enter a city name");
    return;
  }

  /* 🔑 AIRPORT FIX */
  if (cityName.toLowerCase().includes("airport")) {
    cityName = cityName.replace(/airport/i, "").trim();
  }

  try {
    const geo = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&country=IN`
    ).then(r => r.json());

    if (!geo.results || geo.results.length === 0) {
      showError("City not found in India");
      return;
    }

    const { latitude, longitude, name } = geo.results[0];

    const weather = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`
    ).then(r => r.json());

    updateUI(name, weather);

  } catch (err) {
    showError("Unable to fetch weather. Try again.");
  }
}

/* =======================
   GEOLOCATION WEATHER
======================= */
async function getWeatherByCoords(lat, lon) {
  const weather = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`
  ).then(r => r.json());

  updateUI("Your Location", weather);
}

/* =======================
   UPDATE UI
======================= */
function updateUI(name, weather) {
  const temp = weather.current.temperature_2m;
  const code = weather.current.weather_code;

  document.getElementById("location").textContent = name;
  document.getElementById("temp").textContent = temp;
  document.getElementById("humidity").textContent =
    weather.current.relative_humidity_2m;
  document.getElementById("wind").textContent =
    weather.current.wind_speed_10m;

  document.getElementById("card").style.display = "block";

  setBackground(temp);

  /* Thunder + lightning */
  if (code >= 95) {
    lightning.classList.add("flash");
    setTimeout(() => lightning.classList.remove("flash"), 150);
  }
}

/* =======================
   ERROR HANDLING
======================= */
function showError(msg) {
  const card = document.getElementById("card");
  card.style.display = "block";
  document.getElementById("location").textContent = "Error";
  document.getElementById("temp").textContent = "--";
  document.getElementById("humidity").textContent = "--";
  document.getElementById("wind").textContent = "--";
  alert(msg); // Accessible feedback
}

/* =======================
   BACKGROUND LOGIC
======================= */
function setBackground(temp) {
  document.body.className = "";
  if (temp <= 5) document.body.classList.add("cold");
  else if (temp <= 15) document.body.classList.add("cool");
  else if (temp <= 25) document.body.classList.add("warm");
  else document.body.classList.add("hot");
  setDayNight();
}

/* =======================
   DAY / NIGHT
======================= */
function setDayNight() {
  const hour = new Date().getHours();
  const title = document.getElementById("dayEmoji");

  if (hour >= 18 || hour < 6) {
    document.body.classList.add("night");
    title.textContent = "🌙 Weather App";
  } else {
    title.textContent = "🌞 Weather App";
  }
}
