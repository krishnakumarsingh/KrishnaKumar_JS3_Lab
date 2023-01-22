class CityWeather {
    constructor(items) {
        this.city = {};
        this.lan = "";
        this.long = "";
        this.weatherData = {};
        this.searchInput = "";
        this.cityName = "";
        this.date = "";
        this.todayDegreeName = "";
        // this.apiKey = "7e3f21edee540e6110af347b55eb1ab2";
    }
};

CityWeather.prototype.init = function () {
    const searchCityField = document.getElementById("searchCityField");
    searchCityField.addEventListener("keyup", this.searchCityField);
    this.date = this.cityWeatherDays();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(this.successFunction, this.errorFunction);
    } else {
        this.errorFunction()
    }
};

CityWeather.prototype.successFunction = function (position) {
    cityWeather.lan = position.coords.latitude;
    cityWeather.long = position.coords.longitude;
    cityWeather.showCityWeather();

    cityWeather.getCity([
        cityWeather.lan,
        cityWeather.long
    ]);
};

CityWeather.prototype.getCity = function (coordinates) {
    const apiPath = `https://api.bigdatacloud.net/data/reverse-geocode-client`;
    const searchPrams = `?latitude=${this.lan}&longitude=${this.long}&format=json`;
    const cityWeatherData = this.cityWeatherApiCall(apiPath, searchPrams);
    cityWeatherData.then(response => {
        this.cityName = `${response.city}, ${response.countryName}`;
    });
}

CityWeather.prototype.errorFunction = function () {
    alert('Error!');
};

CityWeather.prototype.searchCityField = function (event) {
    const searchText = event.target.value;
    cityWeather.loadCityList(searchText);
};

CityWeather.prototype.cityWeatherApiCall = function (apiPath, payload) {
    return new Promise((resolve, reject) => {
        fetch(`${apiPath}${payload}`)
            .then(response => {
                if(response.status === 200) {
                    resolve(response.json());
                } else {
                    reject();
                }
            }).catch((errorResponse) => {
                console.log(errorResponse);
                reject();
            });
    });
};

CityWeather.prototype.showCityWeather = function () {
    const cityName = document.getElementById("cityName");
    const dateName = document.getElementById("dateName");
    const currentDegreeName = document.getElementById("currentDegreeName");
    const currentWeatherName = document.getElementById("currentWeatherName");
    const todayDegreeName = document.getElementById("todayDegreeName");

    const apiPath = `https://api.open-meteo.com/v1/forecast`;
    const date = new Date();
    // const dateFormate = date.toString().split(" ");
    const dateDateFormate = date.toLocaleDateString().split("/");
    const dateStartDate = `${dateDateFormate[2]}-${dateDateFormate[1]}-${dateDateFormate[0]}`;
    const dateEndDate = `${dateDateFormate[2]}-${dateDateFormate[1]}-${dateDateFormate[0]}`;
    const searchPrams = `?latitude=${this.lan}&longitude=${this.long}&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&current_weather=true&timezone=Asia%2FBangkok&start_date=${dateStartDate}&end_date=${dateEndDate}`;
    const cityWeatherData = this.cityWeatherApiCall(apiPath, searchPrams);
    
    this.date = this.cityWeatherDays();
    cityWeatherData.then(res => {
        dateName.innerHTML = this.date;
        this.todayDegreeName = `${res?.daily?.temperature_2m_max[0]}${res?.daily_units?.temperature_2m_max} / ${res?.daily?.temperature_2m_min[0]}${res?.daily_units?.temperature_2m_max}`
        todayDegreeName.innerHTML = this.todayDegreeName;
        currentWeatherName.innerHTML = this.showWeather(res?.current_weather?.weathercode);
        cityName.innerHTML = this.cityName;
        currentDegreeName.innerHTML = `${res?.current_weather.temperature}${res?.daily_units?.temperature_2m_max}`;
    });
};

CityWeather.prototype.loadCityList = function (searchText) {
    let list = "";
    const searchResults = document.getElementById("searchResults");
    searchResults.style.display = "block";
    if (searchText?.length >= 3) {
        const apiPath = `https://geocoding-api.open-meteo.com/v1/search`;
        const searchPrams = `?name=${searchText}`;
        const cityData = this.cityWeatherApiCall(apiPath, searchPrams);
        cityData.then(res => {
            this.city = res?.results;
            this.city?.forEach((element, index) => {
                list += `<li
                    class="cityList"
                    onclick="cityWeather.searchCitySelect(event)"
                    data-name="${element.name ? element.name + "," : ""} ${element.admin1 ? element.admin1 + ',' : ""} ${element.country ? element.country + "" : ""}"
                    data-lan=${element.latitude}
                    data-long=${element.longitude}
                >
                    <span class="dropdown-item">
                        <img
                            height="16" src="https://assets.open-meteo.com/images/country-flags/${element.country_code}.svg" alt="${element.country}"
                            onerror="this.style.display='none'"
                        > 
                        <span>${element.name ? element.name + "," : ""} ${element.admin1 ? element.admin1 + ',' : ""} ${element.country ? element.country : ""}</span>
                            <br />
                            <small class="text-muted">latitude: ${element.latitude} longitude: ${element.longitude}</small>
                        </span>
                </li>`;
            });
            searchResults.innerHTML = list;
        });
    } else {
        list = `<li>-- No Result --</li>`;
        searchResults.innerHTML = list;
    }
};

CityWeather.prototype.cityWeatherDays = function() {
    let day;
    const days =["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    return `${days[new Date().getDay()]} ${new Date().getDate()} ${month[new Date().getMonth()]} ${new Date().getFullYear()}`;
}

CityWeather.prototype.showWeather = function (eventType) {
    let weatherType = "";
    const weatherInformation = document.getElementById("weatherInformation");
    let weathercode = [{"0": "Clear Sky", "1": "Mainly Clear", "2": "Partly Cloudy", "3": "Overcast", "45": "Fog", "48": "Depositing Rime Fog", "51": "Drizzle: Light", "53": "Drizzle: Moderate", "55": "Drizzle: Dense Intensity", "56": "Freezing Drizzle: Light", "57": "Freezing Drizzle: Dense Intensity", "61": "Rain: Slight", "63": "Rain: Moderate", "65": "Rain: Heavy Intensity", "66": "Freezing Rain: Light", "67": "Freezing Rain: heavy intensity", "71": "Snow fall: Slight", "73": "Snow fall: moderate", "75": "Snow fall: heavy intensity", "77": "Snow grains", "80": "Rain showers: Slight", "81": "Rain showers: moderate", "82": "Rain showers: violent", "85": "Snow showers slight", "86": "Snow showers heavy", "95": "Thunderstorm: Slight or moderate", "96": "Thunderstorm with slight", "99": "Thunderstorm with heavy hail"}];
    weatherType = weathercode[0][eventType];
    weatherInformation.classList = `weather-information ${this.weatherTypeJoin(weatherType)}`;
    weatherInformation.style.backgroundImage = `url("../assets/img/${this.weatherTypeJoin(weatherType)}.jpg"), url("../assets/img/bg.jpg")`;
    weatherInformation.style.backgroundPosition = "100%";
    return weatherType;
};

CityWeather.prototype.weatherTypeJoin = function (text) {
    return text.toLowerCase().split(":").join("-").split(" ").join("-").replace("--", "-");
};

CityWeather.prototype.searchCitySelect = function (event) {
    event.preventDefault();

    const searchCityField = document.getElementById("searchCityField");
    const searchResults = document.getElementById("searchResults");
    searchResults.style.display = "none";
    searchCityField.value = event?.currentTarget?.dataset?.name?.trim();
    this.cityName = event?.currentTarget?.dataset?.name?.trim();
    this.lan = event?.currentTarget?.dataset?.lan?.trim();
    this.long = event?.currentTarget?.dataset?.long?.trim();
    this.showCityWeather();
    searchResults.innerHTML = "";
};

const cityWeather = new CityWeather();
cityWeather.init();