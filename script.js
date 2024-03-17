//------------ INITIALIZE MAP ---------------//

mapboxgl.accessToken = 'pk.eyJ1Ijoia3Nob2VzdGVyIiwiYSI6ImNsdG9jOXN3djBoMnYyaW1zYnRuZ3VkYzYifQ.Z976OphNTmOc_8gG7O6khQ'; // access token

const map = new mapboxgl.Map({ // new map
    container: 'my-map',
    style: 'mapbox://styles/kshoester/cltsd7k7400ct01qs61u02utn', // mapbox style created using Toronto census tracts
    center: [-79.39, 43.66], // starting position
    zoom: 12,
});

//------------ MAP CONTROLS ---------------//

/* map.addControl( // add search control to map overlay (requires plugin as source in html body)
    new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        countries: 'ca' // restricts search to places inside Canada
    })
); */

// create geocoder as a variable
const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    countires: 'ca'
});
// append geocoder variable to geocoder html div to position on page
document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

map.addControl(new mapboxgl.NavigationControl(), 'bottom-left'); // add zoom + rotation controls

map.addControl(new mapboxgl.FullscreenControl()); // add full screen control

//------------ DATA VISUALIZATION ---------------//

map.on('load', () => {

// adding green spaces data (vector tileset) to map 
    map.addSource('gspaces-data', { // source id
        'type': 'vector', 
        'url': 'mapbox://kshoester.5iice3d4' // mapbox tileset id
    });
    map.addLayer({
        'id': 'green-spaces', // layer id
        'type': 'fill',
        'source': 'gspaces-data', // source id
        'paint': {
            'fill-color': '#8fc492', // light green
            'fill-opacity': 0.5,
            'fill-outline-color': 'black' 
        },
        'source-layer': 'Green_Spaces-21rd0u' // tileset name
    });
    map.addLayer({ // add visualization of green spaces polygons
        'id': 'green-highlight', // id points to highlighted layer
        'type': 'fill',
        'source': 'gspaces-data', // same source
        'paint': {
            'fill-color': '#8fc492', // same color
            'fill-opacity': 1, // 100% opacity
            'fill-outline-color': 'black'
        },
        'source-layer': 'Green_Spaces-21rd0u',
        'filter': ['==', ['get', '_id'], ''] // set initial filter to return nothing
    });

// adding indoor ice rinks data (geojson from previous lab) to map
    map.addSource('rinks-data', { // source id
        type: 'geojson',
        data: 'https://kshoester.github.io/Lab-2/indoor-ice-rinks-data.geojson' // link to data; publish repository for shorter url
    });
    map.addLayer({
        'id': 'indoor-ice-rinks', // layer id
        'type': 'circle',
        'source': 'rinks-data', // source id
        'paint': {
            'circle-radius': 4,
            'circle-color': [
                'step', // STEP expression to produce stepped results based on value pairs
                ['get', 'Pad Length'], // GET expression to retrive value from 'Pad Length' data field
                '#bcbddc', //  (purple scale) assigned to any values
                100, '#bcbddc', // colour assigned to all values less than 100m; same colour as the one above to ensure all values from 0 - 100m
                150, '#756bb1', // 100 - 150m
                200, '#54278f' // 150 - 200m
            ]
        },
    });

// adding cool spaces data (geojson) to map
    map.addSource('coolspaces-data', { // source id
        type: 'geojson',
        data: 'https://kshoester.github.io/Lab-3/data/air-conditioned-and-cool-spaces.geojson' // link to data
    });
    map.addLayer({
        'id': 'water-facilities', // layer id
        'type': 'circle',
        'source': 'coolspaces-data', // source id
        'paint': {
            'circle-radius': 3,
            'circle-color': [
                'match', // using match to set color based on string (get/step does not work with string values)
                ['get', 'locationCode'],
                'SPLASHPAD', '#fdb462',
                'INDOOR POOL', '#fb8072',
                'OUTDOOR POOL', '#fccde5',
                '#ffffb3' // default color if no match is found
            ]
        },
    }); 

// adding water sources data (geojson) to map
    map.addSource('water-data', { // source id
        type: 'geojson',
        data: 'https://kshoester.github.io/Lab-3/data/water-locations.geojson'
    });
    map.addLayer({
        'id': 'water-locations', // layer id
        'type': 'circle',
        'source': 'water-data', // source id
        'paint': {
            'circle-radius': [ // change marker size on zoom
                'interpolate', // use interpolate operator to define linear relationship between zoom level + circle radius; produces continuous results by interpolating between value pairs
                ['linear'], // linear interpolation between stops 
                ['zoom'], // zoom expression changes appearance with zoom level
                12, 2, // when zoom level is 12 or less, radius will be 2 px
                12.5, 2.5, // when zoom level is 12.5 - 13, radius will be 2.5 px
                13, 3 // when zoom level is 13 or greater, radius will be 3 px
            ], 
            'circle-color': '#9ecae1' // blue
        },
    }); 

});

//------------ EVENTS ---------------//

// add pop-up on click event; show pop up of location directions when water-location is clicked
map.on('mouseenter', 'water-locations', () => {
    map.getCanvas().style.cursor = 'pointer'; // change cursor to pointer when mouse is hovering water-locations
});
map.on('mouseleave', 'water-locations', () => { // change pointer to cursor when mouse is NOT hovering water-locations
    map.getCanvas().style.cursor = '';
});

map.on('click', 'water-locations', (e) => { 
    new mapboxgl.Popup() // declare new popup object on each click
    .setLngLat(e.lngLat) // access long/lat based on mouse click location
    .setHTML('<b>Location Directions: </b>' + e.features[0].properties.location_details) // use click event properties to write popup text
    .addTo(map);
});

// add pop-up on click event; show pop up of park name when green-spaces is clicked
map.on('mouseenter', 'green-spaces', () => {
    map.getCanvas().style.cursor = 'pointer'; // change cursor to pointer when mouse is hovering green-spaces
});
map.on('mouseleave', 'green-spaces', () => { // change pointer to cursor when mouse is NOT hovering green-spaces
    map.getCanvas().style.cursor = '';
});

map.on('click', 'green-spaces', (e) => { 
    new mapboxgl.Popup() // declare new popup object on each click
    .setLngLat(e.lngLat) // access long/lat based on mouse click location
    .setHTML('<b>Park Name: </b>' + e.features[0].properties.AREA_NAME) // use click event properties to write popup text
    .addTo(map);
});

// add simple hover event for green spaces using setFilter() method
map.on('mousemove', 'green-spaces', (e) => {
    if (e.features.length > 0) { // if there are features in the event features array (features under the mouse hover), go into the conditional
        map.setFilter('green-highlight', ['==', ['get', '_id'], e.features[0].properties._id]); // set filter of green-highlight to display the hovered feature
    }
});

// add event listener which returns to full map view on button  click (flyTo method)
document.getElementById('returnbutton').addEventListener('click', () => {
    map.flyTo({
        center: [-79.3832, 43.6532],
        zoom: 12,
        essential: true
    });
});

// change display of legend based on check box
let legendcheck = document.getElementById('legendcheck');

legendcheck.addEventListener('click', () => {
    if (legendcheck.checked) {
        legendcheck.checked = true;
        legend.style.display = 'block';
    }
    else {
        legend.style.display = "none";
        legendcheck.checked = false;
    }
});

// change map layer display based on check box using setLayoutProperty
let layercheck = document.getElementById('layercheck');

document.getElementById('layercheck').addEventListener('change', (e) => {
    map.setLayoutProperty(
        'water-facilities',
        'visibility',
        e.target.checked ? 'visible' : 'none'
    );
});

// filter water-facilities data layer to show selected facility type from dropdown selection
let locationcode;

document.getElementById("locationcodefieldset").addEventListener('change',(e) => {   
    locationcode = document.getElementById('locationCode').value;

    console.log(locationcode); // useful for testing whether correct values are returned from dropdown selection

    if (locationcode == 'All') { // returns all points from water-facilities that have a value in _id
        map.setFilter(
            'water-facilities',
            ['has', '_id'] 
        );
    } else { // returns points with locationCode value that matches dropdown selection
        map.setFilter(
            'water-facilities',
            ['==', ['get', 'locationCode'], locationcode] // returns points with locationCode value that matches dropdown selection
        );
    }

});

//------------ JAVASCRIPT LEGEND ---------------//
const waterfaclegendlabels = [ // declare array variables for labels + colours of water-facilities layer
    'Splashpad',
    'Indoor Pool',
    'Outdoor Pool',
];
const waterfaclegendcolours = [
    '#fdb462',
    '#fb8072',
    '#fccde5',
];

const waterfaclegend = document.getElementById('water-legend'); // declare legend variable using legend div tag

// create a block to put colour/label in for each layer
waterfaclegendlabels.forEach((label, i) => {
    const colour = waterfaclegendcolours[i];

    const item = document.createElement('div');
    const key = document.createElement('span');

    key.className = 'legend-key';
    key.style.backgroundColor = colour;

    const value = document.createElement('span');
    value.innerHTML = `${label}`;

    item.appendChild(key);
    item.appendChild(value);

    waterfaclegend.appendChild(item);
});

const rinklegendlabels = [ // declare array variables for labels + colours of indoor-ice-rinks layer
    '0-100m',
    '100-150m',
    '150-200m'
];
const rinklegendcolours = [
    '#bcbddc',
    '#756bb1',
    '#54278f',
];

const rinklegend = document.getElementById('rink-legend'); // declare legend variable using legend div tag

// create a block to put colour/label in for each layer
rinklegendlabels.forEach((label, i) => {
    const colour = rinklegendcolours[i];

    const item = document.createElement('div');
    const key = document.createElement('span');

    key.className = 'legend-key';
    key.style.backgroundColor = colour;

    const value = document.createElement('span');
    value.innerHTML = `${label}`;

    item.appendChild(key);
    item.appendChild(value);

    rinklegend.appendChild(item);
});

const misclegendlabels = [ // declare array variables for labels + colours of other layers
    'Drinking Water',
    'Park'
];
const misclegendcolours = [
    '#9ecae1',
    '#8fc492'
];

const misclegend = document.getElementById('misc-legend'); // declare legend variable using legend div tag

// create a block to put colour/label in for each layer
misclegendlabels.forEach((label, i) => {
    const colour = misclegendcolours[i];

    const item = document.createElement('div');
    const key = document.createElement('span');

    key.className = 'legend-key';
    key.style.backgroundColor = colour;

    const value = document.createElement('span');
    value.innerHTML = `${label}`;

    item.appendChild(key);
    item.appendChild(value);

    misclegend.appendChild(item);
});