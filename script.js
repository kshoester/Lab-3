mapboxgl.accessToken = 'pk.eyJ1Ijoia3Nob2VzdGVyIiwiYSI6ImNsdG9jOXN3djBoMnYyaW1zYnRuZ3VkYzYifQ.Z976OphNTmOc_8gG7O6khQ';

const map = new mapboxgl.Map({
    container: 'my-map',
    style: 'mapbox://styles/kshoester/cltsd7k7400ct01qs61u02utn',
    center: [-79.39, 43.66],
    zoom: 12,
});

map.on('load', () => {

/* adding green spaces data (vector tileset) to map */
    map.addSource('gspaces-data', {
        'type': 'vector',
        'url': 'mapbox://kshoester.5iice3d4'
    });
    map.addLayer({
        'id': 'green-spaces',
        'type': 'fill',
        'source': 'gspaces-data',
        'paint': {
            'fill-color': '#8fc492',
            'fill-opacity': 0.6,
            'fill-outline-color': 'black' /* find something better */
        },
        'source-layer': 'Green_Spaces-21rd0u'
    },
    );

/* adding indoor ice rinks data (geojson from previous lab) to map */
    map.addSource('rinks-data', {
        type: 'geojson',
        data: 'https://kshoester.github.io/Lab-2/indoor-ice-rinks-data.geojson'
    });
    map.addLayer({
        'id': 'indoor-ice-rinks',
        'type': 'circle',
        'source': 'rinks-data',
        'paint': {
            'circle-radius': 4,
            'circle-color': '#6388bf'
        }
    });

/* adding cool spaces data (geojson) to map */
    map.addSource('cspaces-data', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/kshoester/Lab-3/main/data/air-conditioned-and-cool-spaces.geojson'
    });
    map.addLayer({
        'id': 'cool-spaces',
        'type': 'circle',
        'source': 'cspaces-data',
        'paint': {
            'circle-radius': 2,
            'circle-color': '#add8e6'
        }
    });

});



/* https://kshoester.github.io/Lab-3/air-conditioned-and-cool-spaces.geojson */ 