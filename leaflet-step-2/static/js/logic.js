// GeoJSON links
var earthquakesUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var faultLinesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

// Load earthquake data
d3.json(earthquakesUrl, function(earthquakeData) {

    // Create earthquake markers
    var earthquakeMarkers = createMarkers(earthquakeData.features);
    // Create layer with earthquake markers
    var earthquakes = L.layerGroup(earthquakeMarkers);


    // Load fault lines data
    d3.json(faultLinesUrl, function(faultLinesData) {

        // Create fault lines
        var polyLines = createLines(faultLinesData.features);
        // Create layer with fault lines
        var faultLines = L.layerGroup(polyLines);


        /* Create maps */
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

        // All overlay maps
        var overlayMaps = {
            "Earthquakes": earthquakes,
            "Fault Lines": faultLines,    
        };

        // Create map with initial layers
        var myMap = L.map("map", {
            center: [40, -110],
            zoom: 3,
            layers: [defaultMap, earthquakes, faultLines]
        });    

        // Layer control
        L.control.layers(baseMaps, overlayMaps, {
            collapsed: false
        }).addTo(myMap);

    });
});


/* Earthquakes Functions */

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

// Create earthquake markers
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
    }

    // var legend = createLegend(earthquakes);

    // earthquakes.addLayer(legend);

    return earthquakeMarkers;
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

    return legend;
}


/* Fault Lines Functions */

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

    return polyLines;
}
