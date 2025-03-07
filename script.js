import * as maptilersdk from '@maptiler/sdk';
maptilersdk.config.apiKey = import.meta.env.VITE_MAPTILER_API_KEY;


var map = new maptilersdk.Map({
    container: 'map',
    style: `https://api.maptiler.com/maps/916f2464-4680-4f1c-9514-86c90aa48edc/style.json?key=${maptilersdk.config.apiKey}`,
    center: [-0.17, 51.501],
    zoom: 11,
    interactive: false,
    navigationControl: false,
    geolocateControl: false,
});

// var loadingScreen = document.getElementById('loading-screen');

// Pre-create a single popup instance (improves performance)
var popup = new maptilersdk.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: [10, -9],
    // anchor: 'auto',
    anchor: 'top-left',
    className: 'place-popup'
});

function generatePopupContent(place) {
    var placeName = place.properties?.['GAZETTEER_ENTRY.NAME1'] || 'Unknown Place';
    var category_1 = place.properties?.line_1 || ''; 
    var category_2 = place.properties?.line_2 || '';
    var category_3 = place.properties?.line_3 || '';

    return `
        <div class="place-name-container">
            <div class="place-name-line"></div>
            <div class="place-name-popup">${placeName}</div>
        </div>    
        <div class="category-container">
            <div id="category_1" class="category-popup">${category_1}</div>
            <div id="category_2" class="category-popup">${category_2}</div>
            <div id="category_3" class="category-popup">${category_3}</div>
        </div>
        `;
}

// map.on('loading', function() {
//     loadingScreen.style.display = 'block';
// });

map.on('load', async function () {
    const geojson_places = await maptilersdk.data.get('9ac8fd38-f72e-4d44-a29c-bcd5114a6b6a');
    // console.log(map.getStyle().layers);
    
    map.addSource('geojson_places', {
        type: 'geojson',
        data: geojson_places,
        generateId: true
        // showLabel: true
    });

    map.addLayer({
        'id': 'places_points_hover_reaction',
        'type': 'circle',
        'source': 'geojson_places',
        layout: { 
            'visibility': 'visible'},
        paint: {
            'circle-opacity': 0,
            'circle-stroke-opacity':  0,
            'circle-radius': 10,
            'circle-stroke-color': 'white',
            'circle-stroke-width': 7
        }
    });

    map.addLayer({
        id: 'places_labels',
        type: 'symbol',
        source: 'geojson_places',
        layout: {
            'visibility': 'visible',
            'text-field': ['get', 'GAZETTEER_ENTRY.NAME1'],
            'text-font': ["Lexend"],
            'text-variable-anchor': ['left'],
            'text-justify': 'left',
            'text-size': 10,
            'text-offset': [0.8, 0],
            'text-anchor': 'left',
            'text-max-width': 20,
            // 'text-max-height': 4,
            // 'text-allow-overlap': true,
        },
        paint: {
            'text-color': "#83412F"
        }
    });

    map.on('mouseenter', 'places_points_hover_reaction', function (e) {
        // map.setPaintProperty('places_labels', 'text-color', '#9E7267');
        
        var place = e.features[0];
        var coordinates = place.geometry.coordinates.slice();
        // Precompute and set the popup content
        var popupContent = generatePopupContent(place);
    
        // Update popup content and position
        popup.setLngLat(coordinates)
             .setHTML(popupContent)
             .addTo(map);

        // // Wait for DOM update before selecting elements
        setTimeout(() => {
            var categories = document.querySelectorAll('.category-popup');
            categories.forEach((category, index) => {
                setTimeout(() => {
                    category.classList.add('show');
                }, index * 100);
            });
        }, 50);

        // Change cursor style to indicate interactivity
        map.getCanvas().style.cursor = 'pointer';

        var categories = document.querySelectorAll('.category-popup');
        categories.forEach(category => {
            category.classList.remove('show');
        });
    });

    map.on('mouseleave', 'places_points_hover_reaction', function () {

        // map.setPaintProperty('places_labels', 'text-color', '#7C2913');
        popup.remove();
        map.getCanvas().style.cursor = ''; // Reset cursor to default
    });
});
