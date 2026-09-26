const API_KEY = "YOUR_OPENWEATHER_API_KEY";

const weatherSection =
    document.getElementById("weatherSection");

const loading =
    document.getElementById("loading");

const errorMessage =
    document.getElementById("errorMessage");


// Search weather

async function searchWeather() {

    const city =
        document.getElementById("cityInput").value.trim();

    if (!city) {
        return;
    }

    await fetchWeather(city);
}


// Quick location

function searchQuick(city) {

    document.getElementById("cityInput").value = city;

    fetchWeather(city);
}


// Enter key

function handleEnter(event) {

    if (event.key === "Enter") {
        searchWeather();
    }

}


// Fetch weather

async function fetchWeather(city) {

    showLoading();

    try {

        const response =
            await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
            );

        if (!response.ok) {
            throw new Error("City not found");
        }

        const data =
            await response.json();

        displayWeather(data);

        await fetchForecast(
            data.coord.lat,
            data.coord.lon
        );

    }

    catch (error) {

        showError();

        console.error(error);

    }

    finally {

        hideLoading();

    }

}


// Display weather

function displayWeather(data) {

    weatherSection.classList.remove("hidden");

    errorMessage.classList.add("hidden");


    document.getElementById("locationName")
        .textContent = data.name;


    document.getElementById("locationCountry")
        .textContent = data.sys.country;


    document.getElementById("temperature")
        .textContent =
        Math.round(data.main.temp) + "°";


    document.getElementById("feelsLike")
        .textContent =
        Math.round(data.main.feels_like) + "°";


    document.getElementById("humidity")
        .textContent =
        data.main.humidity + "%";


    document.getElementById("wind")
        .textContent =
        Math.round(data.wind.speed * 3.6)
        + " km/h";


    document.getElementById("visibility")
        .textContent =
        (data.visibility / 1000).toFixed(1)
        + " km";


    document.getElementById("pressure")
        .textContent =
        data.main.pressure + " hPa";


    document.getElementById("weatherDescription")
        .textContent =
        capitalize(data.weather[0].description);


    document.getElementById("weatherIcon")
        .textContent =
        getWeatherIcon(
            data.weather[0].main
        );

}


// Forecast

async function fetchForecast(lat, lon) {

    const response =
        await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );

    const data =
        await response.json();

    const container =
        document.getElementById(
            "forecastContainer"
        );

    container.innerHTML = "";

    const days = {};

    data.list.forEach(item => {

        const date =
            item.dt_txt.split(" ")[0];

        if (!days[date]) {
            days[date] = item;
        }

    });


    Object.values(days)
        .slice(0, 5)
        .forEach(item => {

            const date =
                new Date(item.dt * 1000);

            const day =
                date.toLocaleDateString(
                    "en-US",
                    {
                        weekday: "short"
                    }
                );

            const card =
                document.createElement("div");

            card.className =
                "forecast-card";

            card.innerHTML = `

                <strong>${day}</strong>

                <div class="icon">
                    ${getWeatherIcon(
                        item.weather[0].main
                    )}
                </div>

                <h3>
                    ${Math.round(item.main.temp)}°
                </h3>

                <p>
                    ${capitalize(
                        item.weather[0].description
                    )}
                </p>

            `;

            container.appendChild(card);

        });

}


// Get current location

function getLocationWeather() {

    if (!navigator.geolocation) {

        alert(
            "Geolocation is not supported."
        );

        return;
    }

    navigator.geolocation.getCurrentPosition(
        async position => {

            const lat =
                position.coords.latitude;

            const lon =
                position.coords.longitude;

            showLoading();

            try {

                const response =
                    await fetch(
                        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
                    );

                const data =
                    await response.json();

                displayWeather(data);

                await fetchForecast(
                    lat,
                    lon
                );

            }

            catch (error) {

                showError();

            }

            finally {

                hideLoading();

            }

        },

        () => {

            alert(
                "Please allow location access."
            );

        }
    );
}


// Weather icons

function getWeatherIcon(weather) {

    const icons = {

        Clear: "☀️",

        Clouds: "☁️",

        Rain: "🌧️",

        Drizzle: "🌦️",

        Thunderstorm: "⛈️",

        Snow: "❄️",

        Mist: "🌫️",

        Fog: "🌫️",

        Haze: "🌫️"

    };

    return icons[weather] || "🌤️";
}


// Capitalize

function capitalize(text) {

    return text
        .charAt(0)
        .toUpperCase()
        + text.slice(1);

}


// Loading

function showLoading() {

    loading.classList.remove("hidden");

    weatherSection.classList.add("hidden");

    errorMessage.classList.add("hidden");

}


function hideLoading() {

    loading.classList.add("hidden");

}


// Error

function showError() {

    loading.classList.add("hidden");

    weatherSection.classList.add("hidden");

    errorMessage.classList.remove("hidden");

}