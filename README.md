# 🌤️ Weather App

Aplicación web desarrollada con **HTML, CSS y JavaScript** que permite consultar el clima actual y el pronóstico de los próximos cinco días de cualquier ciudad utilizando la **API de Open-Meteo**. La aplicación cuenta con una interfaz moderna, responsive y un sistema de caché para optimizar las consultas y mejorar la experiencia del usuario.

---

## 📋 Descripción

Weather App permite al usuario ingresar el nombre de una ciudad y visualizar información meteorológica en tiempo real, incluyendo la temperatura, la humedad, la velocidad del viento y un pronóstico para los próximos cinco días, tambien comparar el clima de diferentes ciudades.

La aplicación fue desarrollada siguiendo buenas prácticas de programación, implementando manejo de errores, validación de entradas y un sistema de almacenamiento temporal en caché para reducir consultas repetidas a la API.

---

## 🚀 Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript (ES6)
- Open-Meteo Geocoding API
- Open-Meteo Weather Forecast API

---

## ✨ Funcionalidades

- 🔍 Búsqueda del clima por nombre de ciudad.
- 🌡️ Consulta del clima actual.
- 🏙️ Comparación de clima de diferentes ciudades.
- 📅 Pronóstico del tiempo para los próximos 5 días.
- 💨 Visualización de la velocidad del viento.
- 💧 Visualización de la humedad relativa.
- 🌤️ Iconos dinámicos según el estado del clima.
- 💾 Sistema de caché con duración de 30 segundos.
- ⚠️ Uso de la información almacenada en caché cuando la API no está disponible.
- ⌨️ Búsqueda mediante el botón o presionando la tecla **Enter**.
- ⏳ Indicador de carga durante las consultas.
- ❌ Manejo de errores para ciudades inexistentes o problemas de conexión.
- 📱 Diseño responsive para diferentes tamaños de pantalla.

---

## ⚙️ Instalación

1. Clonar el repositorio:

```bash
git clone https://github.com/usuario/weather-app.git
```

2. Abrir la carpeta del proyecto.

3. Ejecutar el archivo **index.html** directamente en el navegador o utilizar la extensión **Live Server** de Visual Studio Code.

No es necesario instalar dependencias adicionales.

---

## 📖 Uso

1. Abrir la aplicación.
2. Escribir el nombre de una ciudad.
3. Presionar el botón **Buscar** o la tecla **Enter**.
4. Visualizar la información meteorológica actual y el pronóstico de cinco días.

---

## 💾 Sistema de caché

La aplicación implementa un sistema de almacenamiento temporal utilizando un **Map** de JavaScript.

Su funcionamiento es el siguiente:

- Guarda automáticamente la información obtenida de la API.
- Si la misma ciudad se consulta nuevamente dentro de los siguientes **30 segundos**, se utilizan los datos almacenados.
- Si la API presenta un error y existe información en caché, esta será utilizada para evitar que la aplicación falle.

---

## 🛡️ Manejo de errores

La aplicación contempla diferentes escenarios:

- Ciudad no encontrada.
- Campo de búsqueda vacío.
- Error de conexión con la API.
- Respuestas inválidas del servidor.
- Recuperación automática mediante caché cuando es posible.

---

## 📈 Posibles mejoras

- Mostrar sensación térmica.
- Mostrar presión atmosférica.
- Mostrar amanecer y atardecer.
- Mostrar calidad del aire.
- Geolocalización automática del usuario.
- Historial de búsquedas recientes.
- Cambio automático del fondo según el clima.
- Agregar gráficos meteorológicos.
- Soporte para varios idiomas.

---

## 👨‍💻 Autor

Desarrollado por **Daniel Casas** con apoyo de la IA, para proyecto académico para el consumo de APIs utilizando JavaScript y Open-Meteo.