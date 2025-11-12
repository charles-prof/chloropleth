var map = L.map('map').setView([20.59, 78.96], 4);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// fetch('./INDIA_STATES.geojson')
fetch('https://raw.githubusercontent.com/datta07/INDIAN-SHAPEFILES/refs/heads/master/INDIA/INDIA_STATES.geojson')
            .then(response => response.json()) // Parse the response into a JSON object
            .then(data => {
                // 4. Add the GeoJSON data to the map once loaded
                L.geoJSON(data, { }).addTo(map);
                // Optional: Fit the map bounds to the new GeoJSON layer
                // map.fitBounds(L.geoJSON(data).getBounds());
            })
            .catch(error => {
                // Handle any errors during the fetch operation
                console.log(`Error fetching GeoJSON: ${error}`);
            });