const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const loader = document.getElementById("loader");
const message = document.getElementById("message");

const weatherContainer = document.getElementById("weatherContainer");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const wind = document.getElementById("wind");
const humidity = document.getElementById("humidity");

const weatherIcon = document.getElementById("weatherIcon");
const forecastCards = document.getElementById("forecastCards");
const cacheInfo = document.getElementById("cacheInfo");

const addCompareBtn = document.getElementById("addCompareBtn");

const compareCityInput = document.getElementById("compareCityInput");
const compareAddBtn = document.getElementById("compareAddBtn");
const compareGrid = document.getElementById("compareGrid");
const compareEmpty = document.getElementById("compareEmpty");
const compareMessage = document.getElementById("compareMessage");

// CONFIGURACIÓN
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

const cache = new Map();
const CACHE_TIME = 30000;

const COMPARE_STORAGE_KEY = "weatherapp_compare_cities";
const COMPARE_MAX = 6;

let ultimaCiudadBuscada = "";

// FUNCIONES AUXILIARES DE UI
function mostrarLoader() {
    loader.classList.remove("hidden");
}

function ocultarLoader() {
    loader.classList.add("hidden");
}

function mostrarMensaje(texto) {
    message.textContent = texto;
    message.classList.remove("hidden");
}

function ocultarMensaje() {
    message.classList.add("hidden");
}

function mostrarWeather() {
    weatherContainer.classList.remove("hidden");
}

function ocultarWeather() {
    weatherContainer.classList.add("hidden");
}

function mostrarMensajeCompare(texto) {
    compareMessage.textContent = texto;
    compareMessage.classList.remove("hidden");

    setTimeout(() => compareMessage.classList.add("hidden"), 3500);
}

// ICONOS
function obtenerIcono(code) {

    if (code === 0) return "☀️";
    if (code === 1 || code === 2) return "🌤️";
    if (code === 3) return "☁️";
    if (code === 45 || code === 48) return "🌫️";
    if (code >= 51 && code <= 67) return "🌦️";
    if (code >= 71 && code <= 77) return "❄️";
    if (code >= 80 && code <= 82) return "🌧️";
    if (code >= 95) return "⛈️";

    return "🌍";
}

// LLAMADAS A LA API
function obtenerCoordenadas(ciudad) {

    return fetch(`${GEOCODING_URL}?name=${encodeURIComponent(ciudad)}&count=1`)

        .then(response => {

            if (!response.ok) {
                throw new Error("Error al conectar con el servicio.");
            }

            return response.json();
        })

        .then(data => {

            if (!data.results) {
                throw new Error("Ciudad no encontrada.");
            }

            return {
                nombre: data.results[0].name,
                lat: data.results[0].latitude,
                lon: data.results[0].longitude
            };
        });
}

function obtenerClima(lat, lon) {

    return fetch(`${WEATHER_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`)
        .then(response => {

            if (!response.ok) {
                throw new Error("No fue posible consultar el clima.");
            }

            return response.json();
        });
}

function obtenerPronostico(lat, lon) {
    return fetch(`${WEATHER_URL}?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`)

        .then(response => {

            if (!response.ok) {
                throw new Error("No fue posible consultar el pronóstico.");
            }
            return response.json();

        });
}

// CONSULTAR CLIMA (CON CACHÉ)
function consultarClima(ciudad, { mostrarEstadoCache = false } = {}) {

    const clave = ciudad.toLowerCase().trim();
    const ahora = Date.now();

    if (cache.has(clave)) {

        const datosCache = cache.get(clave);

        if ((ahora - datosCache.timestamp) < CACHE_TIME) {

            if (mostrarEstadoCache) {
                cacheInfo.textContent = "📦 Datos obtenidos desde la caché";
            }

            return Promise.resolve(datosCache.datos);
        }
    }

    if (mostrarEstadoCache) {
        cacheInfo.textContent = "";
    }

    return obtenerCoordenadas(ciudad)

        .then(coordenadas => {

            return Promise.all([
                obtenerClima(coordenadas.lat, coordenadas.lon),
                obtenerPronostico(coordenadas.lat, coordenadas.lon)
            ]).then(([clima, pronostico]) => ({
                nombre: coordenadas.nombre,
                clima,
                pronostico
            }));
        })

        .then(resultado => {

            cache.set(clave, {
                datos: resultado,
                timestamp: Date.now()
            });

            return resultado;
        })

        .catch(error => {

            if (cache.has(clave)) {

                if (mostrarEstadoCache) {
                    cacheInfo.textContent = "⚠ API no disponible - usando caché";
                }

                return cache.get(clave).datos;
            }

            throw error;
        });
}


// MOSTRAR CLIMA PRINCIPAL
function mostrarClima(ciudad, clima) {

    cityName.textContent = ciudad;
    temperature.textContent = `${Math.round(clima.current.temperature_2m)}°C`;
    wind.textContent = `${clima.current.wind_speed_10m} km/h`;
    humidity.textContent = `${clima.current.relative_humidity_2m}%`;
    weatherIcon.textContent = obtenerIcono(clima.current.weather_code);

}

function mostrarPronostico(pronostico) {

    forecastCards.innerHTML = "";

    const dias = pronostico.daily.time;
    const maximas = pronostico.daily.temperature_2m_max;
    const minimas = pronostico.daily.temperature_2m_min;
    const codigos = pronostico.daily.weather_code;

    dias.forEach((fecha, index) => {

        const tarjeta = document.createElement("div");
        tarjeta.className = "forecast-card";

        const fechaFormateada = new Date(fecha + "T00:00:00").toLocaleDateString("es-ES", {
            weekday: "short",
            day: "numeric",
            month: "short"
        });

        tarjeta.innerHTML = `
            <h3>${index === 0 ? "Hoy" : `Día ${index + 1}`}</h3>
            <p class="forecast-date">${fechaFormateada}</p>
            <div class="forecast-icon">${obtenerIcono(codigos[index])}</div>
            <p class="forecast-max">${Math.round(maximas[index])}°C</p>
            <p class="forecast-min">${Math.round(minimas[index])}°C</p>
        `;

        forecastCards.appendChild(tarjeta);
    });

    animarTarjetas(".forecast-card");
}

function animarTarjetas(selector) {

    const tarjetas = document.querySelectorAll(selector);

    tarjetas.forEach((tarjeta, index) => {

        tarjeta.style.opacity = "0";
        tarjeta.style.transform = "translateY(25px)";

        setTimeout(() => {

            tarjeta.style.transition = "all .5s ease";
            tarjeta.style.opacity = "1";
            tarjeta.style.transform = "translateY(0)";

        }, index * 100);
    });
}

// BUSCAR CIUDAD PRINCIPAL
function buscarCiudad() {

    const ciudad = cityInput.value.trim();

    ocultarMensaje();

    if (ciudad === "") {
        mostrarMensaje("Ingrese una ciudad.");
        ocultarWeather();
        return;
    }

    mostrarLoader();
    ocultarWeather();
    addCompareBtn.classList.remove("is-added");

    consultarClima(ciudad, { mostrarEstadoCache: true })

        .then(({ nombre, clima, pronostico }) => {

            ultimaCiudadBuscada = nombre;

            mostrarClima(nombre, clima);
            mostrarPronostico(pronostico);
            mostrarWeather();

            if (estaEnComparacion(nombre)) {
                addCompareBtn.classList.add("is-added");
            }

        })

        .catch(error => {
            ocultarWeather();
            mostrarMensaje(error.message);
        })

        .finally(() => {
            ocultarLoader();
        });

}

// COMPARACIÓN DE CIUDADES
function cargarComparacion() {
    try {
        const guardado = JSON.parse(localStorage.getItem(COMPARE_STORAGE_KEY));
        return Array.isArray(guardado) ? guardado : [];

    } catch {
        return [];
    }
}

function guardarComparacion(lista) {
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(lista));
}

let ciudadesComparadas = cargarComparacion();

function estaEnComparacion(ciudad) {
    return ciudadesComparadas.some(c => c.toLowerCase() === ciudad.toLowerCase());
}

function agregarCiudadComparacion(ciudad) {

    ciudad = ciudad.trim();

    if (ciudad === "") {
        mostrarMensajeCompare("Ingrese una ciudad.");
        return;
    }

    if (estaEnComparacion(ciudad)) {
        mostrarMensajeCompare(`${ciudad} ya está en la comparación.`);
        return;
    }

    if (ciudadesComparadas.length >= COMPARE_MAX) {
        mostrarMensajeCompare(`Solo puedes comparar hasta ${COMPARE_MAX} ciudades.`);
        return;
    }

    ciudadesComparadas.push(ciudad);
    guardarComparacion(ciudadesComparadas);
    renderizarComparacion();

    if (ciudad.toLowerCase() === ultimaCiudadBuscada.toLowerCase()) {
        addCompareBtn.classList.add("is-added");
    }
}

function quitarCiudadComparacion(ciudad) {

    ciudadesComparadas = ciudadesComparadas.filter(
        c => c.toLowerCase() !== ciudad.toLowerCase()
    );

    guardarComparacion(ciudadesComparadas);
    renderizarComparacion();

    if (ciudad.toLowerCase() === ultimaCiudadBuscada.toLowerCase()) {
        addCompareBtn.classList.remove("is-added");
    }
}

function crearTarjetaError(ciudad) {

    const tarjeta = document.createElement("div");
    tarjeta.className = "compare-card compare-card--error";

    tarjeta.innerHTML = `
        <button class="compare-card__remove" aria-label="Quitar ${ciudad}">
            <i class="fa-solid fa-xmark"></i>
        </button>
        <div class="compare-card__name">${ciudad}</div>
        <p>No se pudo obtener el clima de esta ciudad.</p>
    `;

    tarjeta.querySelector(".compare-card__remove")
        .addEventListener("click", (evento) => {
            evento.stopPropagation();
            quitarCiudadComparacion(ciudad);
        });
    return tarjeta;
}

function crearTarjetaComparacion(ciudad, datos) {

    const tarjeta = document.createElement("div");
    tarjeta.className = "compare-card";

    tarjeta.innerHTML = `
        <button class="compare-card__remove" aria-label="Quitar ${datos.nombre}">
            <i class="fa-solid fa-xmark"></i>
        </button>
        <div class="compare-card__name">${datos.nombre}</div>
        <div class="compare-card__icon">${obtenerIcono(datos.clima.current.weather_code)}</div>
        <div class="compare-card__temp">${Math.round(datos.clima.current.temperature_2m)}°C</div>
        <div class="compare-card__meta">
            <span><i class="fa-solid fa-wind"></i> ${datos.clima.current.wind_speed_10m} km/h</span>
            <span><i class="fa-solid fa-droplet"></i> ${datos.clima.current.relative_humidity_2m}%</span>
        </div>
    `;

    tarjeta.querySelector(".compare-card__remove")
        .addEventListener("click", (evento) => {
            evento.stopPropagation();
            quitarCiudadComparacion(ciudad);
        });

    tarjeta.addEventListener("click", () => {
        cityInput.value = datos.nombre;
        buscarCiudad();
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
    return tarjeta;
}

function renderizarComparacion() {

    compareGrid.innerHTML = "";

    if (ciudadesComparadas.length === 0) {
        compareEmpty.classList.remove("hidden");
        return;
    }

    compareEmpty.classList.add("hidden");

    const consultas = ciudadesComparadas.map(ciudad =>
        consultarClima(ciudad)
            .then(datos => ({ estado: "ok", ciudad, datos }))
            .catch(() => ({ estado: "error", ciudad }))
    );

    Promise.all(consultas).then(resultados => {

        // Determinar ciudad más cálida y más fría para resaltarlas
        const validos = resultados.filter(r => r.estado === "ok");

        let masCalida = null;
        let masFria = null;

        validos.forEach(r => {

            const temp = r.datos.clima.current.temperature_2m;

            if (!masCalida || temp > masCalida.datos.clima.current.temperature_2m) {
                masCalida = r;
            }
            if (!masFria || temp < masFria.datos.clima.current.temperature_2m) {
                masFria = r;
            }

        });

        compareGrid.innerHTML = "";

        resultados.forEach(resultado => {

            let tarjeta;

            if (resultado.estado === "error") {
                tarjeta = crearTarjetaError(resultado.ciudad);
            } else {
                tarjeta = crearTarjetaComparacion(resultado.ciudad, resultado.datos);
            }

            if (validos.length > 1 && resultado.estado === "ok") {

                const nombreEl = tarjeta.querySelector(".compare-card__name");

                if (resultado === masCalida) {

                    const badge = document.createElement("span");
                    badge.className = "compare-card__badge compare-card__badge--hot";
                    badge.textContent = "🔥 Más cálida";
                    tarjeta.insertBefore(badge, nombreEl);

                } else if (resultado === masFria) {

                    const badge = document.createElement("span");
                    badge.className = "compare-card__badge compare-card__badge--cold";
                    badge.textContent = "❄️ Más fría";
                    tarjeta.insertBefore(badge, nombreEl);

                }
            }

            compareGrid.appendChild(tarjeta);
        });

        animarTarjetas(".compare-card");
    });
}

// EVENTOS
searchBtn.addEventListener("click", buscarCiudad);

cityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") buscarCiudad();
});

cityInput.addEventListener("input", ocultarMensaje);

addCompareBtn.addEventListener("click", () => {

    if (!ultimaCiudadBuscada) return;

    if (estaEnComparacion(ultimaCiudadBuscada)) {
        quitarCiudadComparacion(ultimaCiudadBuscada);
    } else {
        agregarCiudadComparacion(ultimaCiudadBuscada);
    }
});

compareAddBtn.addEventListener("click", () => {
    agregarCiudadComparacion(compareCityInput.value);
    compareCityInput.value = "";
});

compareCityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        agregarCiudadComparacion(compareCityInput.value);
        compareCityInput.value = "";
    }
});

// INICIO
window.addEventListener("load", () => {

    cityInput.value = "Bogotá";
    buscarCiudad();

    renderizarComparacion();
});

console.log("Weather App cargada correctamente.");