var map = L.map("map").setView([20.59, 78.96], 4);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

/**
 * Gets color based on the population value.
 * We are using a simple 3-tier scale here based on the colors you provided.
 */
function getColor(population) {
    // These thresholds should ideally be calculated based on your actual data distribution (quantiles/percentiles),
    // but for simplicity, we'll assume standard ranges as a starting point.
    // Replace these thresholds (e.g., 5000000, 10000000) with values that fit your data's range.

    // Using your provided colors from least to most populous:
    const colorLight = '#efedf5';
    const colorMedium = '#bcbddc';
    const colorDark = '#756bb1';

    if (population > 50000000) {      // Example: Over 5 Crore
        return colorDark;
    } else if (population > 10000000) { // Example: Over 1 Crore
        return colorMedium;
    } else {
        return colorLight;
    }
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.population),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

// Create a custom Leaflet Control
const info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// Method that we will use to update the control's content
info.update = function (props) {
    this._div.innerHTML = '<h4>India State Population</h4>' +  (props ?
        `<b>${props.STNAME_SH}</b><br/>` +
        `Population: <b>${formatPopulation(props.population)}</b>`
        : 'Hover over a state');
};

info.addTo(map);

function highlightFeature(e) {
    const layer = e.target;

    // Set highlight style
    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.9
    });

    // Bring the highlighted layer to the front in some browsers/cases
    if (!L.Browser.ie && L.Browser.opera && L.Browser.chrome) {
        layer.bringToFront();
    }

    // Update the info control with the current state's properties
    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    // This assumes 'geojsonLayer' is a variable holding your L.geoJSON instance
    if (geojsonLayer) {
        geojsonLayer.resetStyle(e.target);
    }
    info.update(); // Reset the info box to default text
}

// Function to attach these event listeners to each feature when it's created
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        // click: zoomToFeature // Optional: You can add a click-to-zoom function here
    });
}

// Helper function to format population nicely into Crores and Lakhs
function formatPopulation(num) {
    if (num >= 10000000) {
        // Format into Crores (1 Crore = 10 million)
        return `${(num / 10000000).toFixed(2)} Crore(s)`;
    } else if (num >= 100000) {
        // Format into Lakhs (1 Lakh = 100 thousand)
        return `${(num / 100000).toFixed(2)} Lakh(s)`;
    } else if (num === undefined) {
      return 'N/A';
    } else {
        return `${num.toLocaleString()} people`;
    }
}

// Function to merge the population data with india states geojson
function mergePopulationData(geojson, population) {
  if (!population) {
    console.error("Population data is missing or undefined.");
    return geojson;
  }

  geojson.features.forEach((feature) => {
    const stateName = feature.properties.STNAME_SH;
    if (population[stateName]) {
      // Add the population property to the geojson feature
      feature.properties.population = population[stateName];
    }
  });
  return geojson;
}

// Main asynchronous function to fetch data and initialize the map
async function initializeMap() {
  try {
    // Fetch both datasets concurrently for better performance
    const [popResponse, geojsonResponse] = await Promise.all([
      fetch("./data/india-population.json"),
      fetch("https://raw.githubusercontent.com/datta07/INDIAN-SHAPEFILES/refs/heads/master/INDIA/INDIA_STATES.geojson")
    ]);

    // Check for HTTP errors immediately after receiving responses
    if (!popResponse.ok) throw new Error(`HTTP error fetching population: ${popResponse.status}`);
    if (!geojsonResponse.ok) throw new Error(`HTTP error fetching geojson: ${geojsonResponse.status}`);

    // Parse both responses to JSON concurrently
    const [populationData, geojsonData] = await Promise.all([
      popResponse.json(),
      geojsonResponse.json()
    ]);

    // Merge the data only after both datasets are fully loaded
    const geojsonWithPopulation = mergePopulationData(geojsonData, populationData);

    // Add the layer to the map (assuming 'L' and 'map' are defined in your environment)
    L.geoJSON(geojsonWithPopulation, {}).addTo(map);

    // Optional: Fit map bounds to the new layer
    // map.fitBounds(L.geoJSON(geojsonWithPopulation).getBounds());

    console.log("Map layers successfully loaded and merged.");

  } catch (error) {
    // Handle any errors from fetching, parsing, or merging
    console.error(`An error occurred during map initialization: ${error}`);
  }
}

// Call the main function to start the process
initializeMap();
