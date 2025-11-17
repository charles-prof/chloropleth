var map = L.map('map').setView([10.69, 78.96], 6);

var mapStyle = {
    // "color": "#ff7800", 
    "weight": 3,
    "opacity": 0.45
};

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Function to merge the rainfall data to the tamilnadu districts outline
function mergeRainfallData(geojson, rainfallData) {
  if (!rainfallData) {
    console.error("Rainfall data is missing or undefined.");
    return geojson;
  }

  geojson.features.forEach((feature) => {
    const districtName = feature.properties.district;
    if (rainfallData[districtName]) {
      // find the rainfall difference to the properties
      feature.properties.rainfall = rainfallData[districtName].Actual - rainfallData[districtName].Normal;
    }
  });
  return geojson;
}

fetch('https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@8d907bc/geojson/states/tamil-nadu.geojson')
            .then(response => response.json()) // Parse the response into a JSON object
            .then(data => {
                // 4. Add the GeoJSON data to the map once loaded
                L.geoJSON(data, { style: mapStyle }).addTo(map);
                // Optional: Fit the map bounds to the new GeoJSON layer
                // map.fitBounds(L.geoJSON(data).getBounds());
            })
            .catch(error => {
                // Handle any errors during the fetch operation
                console.log(`Error fetching GeoJSON: ${error}`);
            });