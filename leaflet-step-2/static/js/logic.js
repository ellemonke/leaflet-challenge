// Outdoors map (default)
var defaultMap = L.tileLayer(MAPBOX_URL, {
    attribution: ATTRIBUTION,
    maxZoom: 18,
    id: "mapbox/outdoors-v11",
    accessToken: API_KEY
});

// Satellite map
var satelliteMap = L.tileLayer(MAPBOX_URL, {
    attribution: ATTRIBUTION,
    maxZoom: 18,
    id: "mapbox/satellite-streets-v11",
    accessToken: API_KEY
});

// All base maps
var baseMaps = {
    "Outdoors": defaultMap,
    "Satellite": satelliteMap
};

// Initialize overlay layers to be filled later
var layers = {
    EARTHQUAKES: new L.layerGroup(),
    FAULT_LINES: new L.layerGroup()    
};

// All overlay maps to be added to the layer control
var overlayMaps = {
    "Earthquakes": layers.EARTHQUAKES,
    "Fault Lines": layers.FAULT_LINES,    
};

// Create map with initial layers
var myMap = L.map("map", {
    center: [40, -110],
    zoom: 3,
    layers: [defaultMap, layers.EARTHQUAKES, layers.FAULT_LINES]
});


// GeoJSON links
var earthquakesUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var faultLinesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

// Load earthquake data
d3.json(earthquakesUrl, function(earthquakeData) {
    // Create overlay earthquake markers
    createMarkers(earthquakeData.features);

    // Load fault lines data
    d3.json(faultLinesUrl, function(faultLinesData) {
        // Create overlay fault lines
        createLines(faultLinesData.features);
    });
});


/* Functions for Earthquakes Layer */

// Prep marker size
function markerSize(magnitude) {
    return magnitude * 15000;
}

// Prep marker color
function markerColor(magnitude) {
    if (magnitude >= 5) {
        var fillColor = "#f06b6b";
    } else if ((magnitude >=4) && (magnitude <5)) {
        var fillColor = "#f0a76b";
    } else if ((magnitude >=3) && (magnitude <4)) {
        var fillColor = "#f3ba4d";
    } else if ((magnitude >=2) && (magnitude <3)) {
        var fillColor = "#f3db4d";
    } else if ((magnitude >=1) && (magnitude <2)) {
        var fillColor = "#e1f34d";
    } else {
        var fillColor = "#b7f34d";
    }
    return fillColor;
}

// Create Earthquake Markers
function createMarkers(features) {

    // Initialize empty markers array
    var earthquakeMarkers = [];
    
    // For each feature
    for (var i=0; i < features.length; i++) {

        // Find coordinates
        var latlong = [features[i].geometry.coordinates[1], features[i].geometry.coordinates[0]];

        // Add circle marker to markers array
        earthquakeMarkers.push(
            L.circle(latlong, {
                radius: markerSize(features[i].properties.mag),
                fillColor: markerColor(features[i].properties.mag),
                fillOpacity: 1,
                color: 'black',
                weight: 0.5

            })
            // Bind a popup
            .bindPopup(features[i].properties.place + "<br>Magnitude: " + features[i].properties.mag)
        );

        // Create layer with markers array
        var earthquakes = L.layerGroup(earthquakeMarkers);

        // Add to Map
        // earthquakes.addTo(myMap);
    }

    createLegend(earthquakes);
}

// Create Legend
function createLegend(earthquakes) {
    // Legend placement
    var legend = L.control({ position: "bottomright" });

    // Create legend
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "legend");

        // Append unordered list
        var ul = L.DomUtil.create("ul", "", div);

        // Magnitude labels
        var labels = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];

        // For each label, append list item with color and label text
        for (var i=0; i < labels.length; i++) {
            var li = L.DomUtil.create("li", "", ul);
            li.innerHTML = "<div class='square' style='background-color:" + markerColor(i) + "'></div>" + labels[i];
        };

        return div;
    };

    // Add to Map
    legend.addTo(myMap);
    earthquakes.addTo(myMap);
}


/* Functions for Fault Lines Layer */

// Create fault lines
function createLines(features) {

    // Initialize empty lines array
    var polyLines = [];

    // For each feature
    for (var i=0; i < features.length; i++) {

        // Find coordinates
        var reversed = features[i].geometry.coordinates[0];

        // Put them in correct order
        var lines = [];
        for (var j=0; j < reversed.length; j++) {
            var coordinate = [reversed[j][1], reversed[j][0]];
            lines.push(coordinate);
        }

        // Add line coordinates to array
        polyLines.push(
            L.polyline(lines, { 
                color: "orange",
                stroke: true,
                weight: 3 
            })
        );
    }

    // Create layer with lines array
    var faultLines = L.layerGroup(polyLines);

    // Add to Map
    faultLines.addTo(myMap);
}


// Layer control
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(myMap);