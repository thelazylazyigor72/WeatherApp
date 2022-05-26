import { sunriseOrSunset, dtConvert, dtConvertDaily, roundTemp, pressureConvert, visibilityConvert, deleteNodes, Populator } from './helper'
import Swiper, {Navigation, Keyboard} from 'swiper'
import './style'
import 'swiper/scss'
import 'swiper/scss/navigation'

//!GET ELEMENTS
//!get search form
const searchForm = document.querySelector('.search-form')

//!get search form input
const searchInput = document.querySelector('.sf__input-field')

//!get search by input btn
const searchByInputBtn = document.querySelector('.sf__input-btn')

//!get search by geolocation btn
const searchByGeoBtn = document.querySelector('.sf__geo-btn')

//!get infoContainer 
const infoContainer = document.querySelector('.sf__data-info')

//!get forecast container
const forecastContainer = document.querySelector('.forecast')

//!get progress bar
const progressBar = document.querySelector('.sf__progress-bar')

//!get goBack to search form btn
const backToSearch = document.querySelector('.forecast__go-back')

//!INIT VARIABLES
//!Variable to store weather data that we get from api
let weatherData;

//!MyAPIkey
const APIKey = 'e95a1aa56d73d6b594d8f9bf81620a61';

//!variable to store maden API Link
let APILink = '';

//!EVENTS
//!get urself back at searchForm by this btn
backToSearch.addEventListener('click', () => {
    forecastContainer.style.display = "none"
    searchForm.style.display = "block"
    progressBar.style.display = 'none'
    deleteNodes()
    localStorage.clear()
})

//!Search weather by cityname when u click search by input button
searchByInputBtn.addEventListener('click', async () => {
    if (searchInput.value) {
        try {
            let link = await apiLinkByCity(searchInput.value)
            let data = await getWeatherData(link)
            weatherData = data
            loadWeatherDataOnPage(weatherData)
        } catch (error) {
            infoContainer.classList.add("sf__data-info__error");
            infoContainer.textContent = `${error.message}`
        }
        searchInput.value = ''
    } else {
        infoContainer.textContent = `You passing no value`
        infoContainer.classList.add('sf__data-info__error')
    }
})

//!Search weather by cityname when u click enter by input button
searchInput.addEventListener('keyup', async (e) => {
    if (e.key === 'Enter' || e.keyCode === 13) {
        try {
            let link = await apiLinkByCity(searchInput.value)
            let data = await getWeatherData(link)
            weatherData = data
            loadWeatherDataOnPage(weatherData)
        } catch (error) {
            infoContainer.classList.add("sf__data-info__error");
            infoContainer.textContent = `${error.message}`
        }
        searchInput.value = ''
    }
})

//!Search weather when u click search by geo button
searchByGeoBtn.addEventListener('click', async () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(onSuccess,onError)
    } else {
        infoContainer.textContent = `geoAPI not supported`
        infoContainer.classList.add('sf__data-info__error')
    }
})

//!Page reload event
document.addEventListener("DOMContentLoaded", async () => {
    getApiLinkFromLocalStorage()
    if (APILink) {
        deleteNodes()
        let data = await getWeatherData(APILink)
        weatherData = data
        loadWeatherDataOnPage(weatherData)
    } else {
        forecastContainer.style.display = "none"
        searchForm.style.display = "block"
        progressBar.style.display = 'none'
    }
})

//!FUNCTIONS
//!Function dat will create an api link based on city, that will be fetched later
const apiLinkByCity = async city => {
    try {
        let response = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${APIKey}`)
        let data = await response.json()
        APILink = `https://api.openweathermap.org/data/2.5/onecall?lat=${data[0].lat}&lon=${data[0].lon}&exclude=minutely,alerts&appid=${APIKey}&units=metric`
        saveApiLinkToLocalStorage(APILink)
        return APILink 
    } catch (error) {
        if (error.name === 'TypeError') {
            throw new TypeError(`There is no city as ${city}`)
        }
    }
}

//!callback onSuccess for .getCurrentPosition()
const onSuccess = async position => {
    APILink =  `https://api.openweathermap.org/data/2.5/onecall?lat=${position.coords.latitude}&lon=${position.coords.longitude}&exclude=minutely,alerts&appid=${APIKey}&units=metric`
    saveApiLinkToLocalStorage(APILink)
    let data = await getWeatherData(APILink)
    weatherData = data
    loadWeatherDataOnPage(weatherData)
}

//!callback onError for .getCurrentPosition()
const onError = err => {
    infoContainer.textContent = err.message
    infoContainer.classList.add('sf__data-info__error')
}

//!Function that will do request to api to try to get data that we need based on already created link
const getWeatherData = async link => {
    try {
        infoContainer.textContent = ''
        infoContainer.classList.remove('sf__data-info__error')
        progressBar.style.display = 'block'
        let response = await fetch(link)
        let data = await response.json()
        return data
    } catch (error) {
        progressBar.style.display = 'none'
        infoContainer.textContent = `Something went wrong...`
        infoContainer.classList.add("sf__data-info__error");
    }
}

//!Function that loads weather data on page 
const loadWeatherDataOnPage = async data => {
    searchForm.style.display = "none"
    forecastContainer.style.display = "block"
    populateCurrentWather(data.current)
    populate24HourWeather(data.hourly)
    populateWeeklyWeather(data.daily)
}

//!Function that populates current weather datas on page
const populateCurrentWather = async data => {
    const node = document.createElement('div')
    node.classList.add('current-weather')
    const loadedCurrentWeather = `
        <div class="cw__identificator">
        <h2>Current Weather</h2>
        </div>
        <div class="cw__content">
            <div class="cw__main">
                <div class="cw__head">
                    <div class="cw__temp-date">
                        <p class="cw__temp">
                            ${roundTemp(data.temp)}℃
                        </p>
                        <div class="cw__date">
                            ${dtConvert(data.dt)}
                        </div>
                    </div>
                    <p class="cw__feelslike">
                        Feels like ${roundTemp(data.feels_like)}℃
                    </p>
                </div>
                <div class="cw__icon">
                    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png" alt="weather icon">
                </div>
                <div class="cw__foot">
                    <div class="cw__weather-details">
                        <p class="cw__weather">
                            ${data.weather[0].main}
                        </p>
                        <p class="cw__weather-desc">
                            ${data.weather[0].description}
                        </p>
                    </div>
                    <div class="cw__sunrise-sunset">
                        <p class="cw__sun-smth">
                            Sunset
                        </p>
                        <p class="cw__sun-time">
                            19:00
                        </p>
                    </div>
                </div>
            </div>
            <div class="cw__extended">
                <table class="cw__extended-table">
                    <tr>
                        <td class="cw__extended-icon">
                            <i class="fas fa-cloud"></i>
                        </td>
                        <td class="cw__td-text">
                            Cloudness (%)
                        </td>
                        <td class="cw__cloudness">
                            ${data.clouds}
                        </td>
                    </tr>
                    <tr>
                        <td class="cw__extended-icon">
                            <i class="fas fa-leaf"></i>
                        </td>
                        <td class="cw__td-text">
                            Dew-point (℃)
                        </td>
                        <td class="cw__dewpoint">
                            ${roundTemp(data.dew_point)}
                        </td>
                    </tr>
                    <tr>
                        <td class="cw__extended-icon">
                            <i class="fas fa-tint"></i>
                        </td>
                        <td class="cw__td-text">
                            Humidity (%)
                        </td>
                        <td class="cw__humidity">
                            ${data.humidity}
                        </td>
                    </tr>
                    <tr>
                        <td class="cw__extended-icon">
                            <i class="fas fa-arrow-down"></i>
                        </td>
                        <td class="cw__td-text">
                            Pressure (mmHg)
                        </td>
                        <td class="cw__pressure">
                            ${pressureConvert(data.pressure)}
                        </td>
                    </tr>
                    <tr>
                        <td class="cw__extended-icon">
                            <i class="fas fa-sun"></i>
                        </td>
                        <td class="cw__td-text">
                            UV-Index
                        </td>
                        <td class="cw__uv">
                            ${data.uvi}
                        </td>
                    </tr>
                    <tr>
                        <td class="cw__extended-icon">
                            <i class="fas fa-eye"></i>
                        </td>
                        <td class="cw__td-text">
                            Visibility (km)
                        </td>
                        <td class="cw__visibility">
                            ${visibilityConvert(data.visibility)}
                        </td>
                    </tr>
                    <tr>
                        <td class="cw__extended-icon">
                            <i class="fas fa-compass"></i>
                        </td>
                        <td class="cw__td-text">
                            Wind direction (deg)
                        </td>
                        <td class="cw__wind-dir">
                            ${data.wind_deg}
                        </td>
                    </tr>
                    <tr>
                        <td class="cw__extended-icon">
                            <i class="fas fa-tornado"></i>
                        </td>
                        <td class="cw__td-text">
                            Wind gust (m/s)
                        </td>
                        <td class="cw__windgust">
                            ${data.wind_gust}
                        </td>
                    </tr>
                    <tr>
                        <td class="cw__extended-icon">
                            <i class="fas fa-wind"></i>
                        </td>
                        <td class="cw__td-text">
                            Wind Speed (m/s)
                        </td>
                        <td class="cw__windspeed">
                            ${data.wind_speed}
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    `
    node.innerHTML = loadedCurrentWeather

    forecastContainer.append(node)
    sunriseOrSunset(data.dt, data.sunrise, data.sunset)
}

//!Function that populates 24h weather datas on page and make it like a slider
const populate24HourWeather = async data => {
    data.length = 25;
    const skeleton = `
    <div class="h-24__identificator">
        <h2>Forecast for next 24 hours</h2>
    </div>
    <div class="swiper h-24__swiper">
        
    </div>
    `
    new Populator("forecast__24-h",skeleton).renderBaseForSwiper()
    const container = document.querySelector('.h-24__swiper')
    const node = document.createElement('div')
    node.classList.add('swiper-wrapper','h-24__swiper-wrapper')
    const skeletonOfSlides = data
    .map(slide => {
        return `
        <div class="swiper-slide h-24__item">
            <h6 class="h-24__item-head">
                ${dtConvert(slide.dt)}
            </h6>
            <div class="h-24__item-icon">
                <img src="https://openweathermap.org/img/wn/${slide.weather[0].icon}@2x.png" alt="weather icon">
            </div>
            <p class="h-24__item-foot">
                ${roundTemp(slide.temp)}°       
            </p>
        </div>
        `
    })
    .join('');
    node.innerHTML = skeletonOfSlides
    container.append(node)
    new Populator('.h-24__swiper').renderBtns()
    /*
    !Вспоним, что с только что созданными элементами мы можем работать
    только сразу после их создания и именно поэтому 
    ниже СРАЗУ после создания мы инициализируем/активируем только 
    что созданный скелет свайпера
    */
    let mySwiper = new Swiper(".h-24__swiper", {
        modules: [Navigation, Keyboard],
        observer: true,
        observeParents: true,
        observeSlideChildren: true,
        centeredSlides: false,
        slidesPerView: 5,
        spaceBetween: 18,
        loop: false,
        grabCursor: true,
        slideToClickedSlide: true,
        navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev"
        },
        keyboard: {
            enabled: false,
        },
        breakpoints: {
            350: {
                slidesPerView: 2,
                spaceBetween: 15
            },
            500: {
                slidesPerView: 3,
                spaceBetween: 16.5
            },
            720: {
                slidesPerView: 4,
                spaceBetween: 17
            },
            960: {
                slidesPerView: 5,
                spaceBetween: 17.5
            },
            1200: {
                slidesPerView: 6,
                spaceBetween: 18
            },
            1400: {
                slidesPerView: 6,
                spaceBetween: 18
            }
        }
    });
}

//!Function that populates weekly weather datas on page and make it like a slider
const populateWeeklyWeather = async data => {
    const skeleton = `
    <div class="weekly__identificator">
        <h2>Forecast for next week</h2>
    </div>
    <div class="weekly__swiper">
        
    </div>
    `
    new Populator("forecast__weekly",skeleton).renderBaseForSwiper()
    const container = document.querySelector('.weekly__swiper')
    const node = document.createElement('div')
    node.classList.add('swiper-wrapper','weekly__swiper-wrapper')
    const skeletonOfSlides = data
    .map(slide => {
        return `
        <div class="swiper-slide weekly__item">
            <h6 class="weekly__item-head">
                ${dtConvertDaily(slide.dt)}
            </h6>
            <div class="weekly__item-icon">
                <img src="https://openweathermap.org/img/wn/${slide.weather[0].icon}@2x.png" alt="weather icon">
            </div>
            <div class="weekly__item-foot">
                <div class="weekly__item-min">
                    <p>Min:</p>
                    <p class="weekly__item-temp">
                        ${roundTemp(slide.temp.min)}°
                    </p>
                </div>
                <div class="weekly__item-max">
                    <p>Max:</p>
                    <p class="weekly__item-temp">
                        ${roundTemp(slide.temp.max)}°
                    </p>
                </div>   
            </div>
        </div>
        `
    })
    .join('');
    node.innerHTML = skeletonOfSlides
    container.append(node)
    new Populator('.weekly__swiper').renderBtns()
    /*
    !Вспоним, что с только что созданными элементами мы можем работать
    только сразу после их создания и именно поэтому 
    ниже СРАЗУ после создания мы инициализируем/активируем только 
    что созданный скелет свайпера
    */
    let myySwiper = new Swiper(".weekly__swiper", {
        modules: [Navigation, Keyboard],
        observer: true,
        observeParents: true,
        observeSlideChildren: true,
        centeredSlides: false,
        slidesPerView: 4,
        spaceBetween: 18,
        loop: false,
        grabCursor: true,
        slideToClickedSlide: true,
        navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev"
        },
        keyboard: {
            enabled: false,
        },
        breakpoints: {
            350: {
                slidesPerView: 1,
                spaceBetween: 15
            },
            500: {
                slidesPerView: 2,
                spaceBetween: 16.5
            },
            720: {
                slidesPerView: 3,
                spaceBetween: 17
            },
            960: {
                slidesPerView: 4,
                spaceBetween: 17.5
            },
            1200: {
                slidesPerView: 5,
                spaceBetween: 18
            },
            1400: {
                slidesPerView: 5,
                spaceBetween: 18
            }
        }
    });
}

//!save current/maden API Link to localStorage
const saveApiLinkToLocalStorage = link => {
    localStorage.setItem(1, JSON.stringify(link))
}

//!get API Link from localStorage, so u can make request skippin part of makin this link
const getApiLinkFromLocalStorage = () => {
    APILink = JSON.parse(localStorage.getItem(1))
}
