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

// Main asynchronous function to fetch data and initialize the map
async function initializeMap() {
  try {
    // Fetch both datasets concurrently for better performance
    const [rainResponse, geojsonResponse] = await Promise.all([
      fetch("./data/tn-rainfall.json"),
      fetch("https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@8d907bc/geojson/states/tamil-nadu.geojson")
    ]);

    // Check for HTTP errors immediately after receiving responses
    if (!rainResponse.ok) throw new Error(`HTTP error fetching population: ${popResponse.status}`);
    if (!geojsonResponse.ok) throw new Error(`HTTP error fetching geojson: ${geojsonResponse.status}`);

    // Parse both responses to JSON concurrently
    const [rainfallData, geojsonData] = await Promise.all([
      rainResponse.json(),
      geojsonResponse.json()
    ]);

    // Merge the data only after both datasets are fully loaded
    const geojsonWithData = mergeRainfallData(geojsonData, rainfallData);

    geojsonLayer = L.geoJSON(geojsonWithdata).addTo(map);

    // Optional: Fit map bounds to the new layer
    // map.fitBounds(L.geoJSON(geojsonWithData).getBounds());

    console.log("Map layers successfully loaded and merged.");

  } catch (error) {
    // Handle any errors from fetching, parsing, or merging
    console.error(`An error occurred during map initialization: ${error}`);
  }
}

// Call the main function to start the process
initializeMap();