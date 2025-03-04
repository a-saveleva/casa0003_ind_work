import * as maptilersdk from '@maptiler/sdk';
maptilersdk.config.apiKey = import.meta.env.VITE_MAPTILER_API_KEY;

var map = new maptilersdk.Map({
    container: 'map',
    style: `https://api.maptiler.com/maps/916f2464-4680-4f1c-9514-86c90aa48edc/style.json?key=${maptilersdk.config.apiKey}`,
    center: [-0.19, 51.505],
    zoom: 11,
    interactive: false
});

// Pre-create a single popup instance (improves performance)
var popup = new maptilersdk.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: [10, -9],
    anchor: 'top-left',
    className: 'place-popup'
});

function generatePopupContent(place) {
    var placeName = place.properties?.['GAZETTEER_ENTRY.NAME1'] || 'Unknown Place';
    var categories = place.properties?.categories || ['Category 1', 'Category 2', 'Category 3'];

    return `
        <div class="place-name-container">
            <div class="place-name-line"></div>
            <div class="place-name-popup">${placeName}</div>
        </div>    
        <div class="category-container">
            ${categories.map((category, index) => 
                `<div id="category-${index}" class="category-popup">${category}</div>`
            ).join('')}
        </div>
    `;
}

map.on('load', async function () {
    const geojson_places = await maptilersdk.data.get('f0234d7a-a4ba-42c3-8729-0ac0a24f412d');

    map.addSource('geojson_places', {
        type: 'geojson',
        data: geojson_places,
        generateId: true
    });

    map.addLayer({
        'id': 'places_points_hover_reaction',
        'type': 'circle',
        'source': 'geojson_places',
        layout: { 'visibility': 'visible' },
        paint: {
            'circle-opacity': 0,
            'circle-stroke-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false], 1, // Fully visible on hover
                0 // Hidden by default
            ],
            'circle-radius': 10,
            'circle-stroke-color': 'white',
            'circle-stroke-width': 7,
        }
    });

    // let placeId = null;

    map.on('mouseenter', 'places_points_hover_reaction', function (e) {
        var place = e.features[0];
        // placeId = e.features[0].id;

        // Set feature state to trigger hover effect
        // map.setFeatureState({ source: 'geojson_places', id: placeId }, { hover: true });

        var coordinates = place.geometry.coordinates.slice();

        // Precompute and set the popup content
        var popupContent = generatePopupContent(place);
    
        // Update popup content and position
        popup.setLngLat(coordinates)
             .setHTML(popupContent)
             .addTo(map);

        // Apply animation delay to categories
        var categories = document.querySelectorAll('.category-popup');
        categories.forEach((category, index) => {
            // Apply the 'show' class after a delay
            setTimeout(() => {
                category.classList.add('show');
            }, index * 100); // 100ms delay for each category
        });

        // Change cursor style to indicate interactivity
        map.getCanvas().style.cursor = 'pointer';

        // Reset category animation (hide them again)
        var categories = document.querySelectorAll('.category-popup');
        categories.forEach(category => {
            category.classList.remove('show');
        });
    });

    map.on('mouseleave', 'places_points_hover_reaction', function () {
        // if (placeId !== null) {
        //     map.setFeatureState({ source: 'geojson_places', id: placeId }, { hover: false });
        //     placeId = null; // Reset placeId after hover
        // }
        // Reuse the same popup instance instead of creating and removing it each time
        popup.remove();
        map.getCanvas().style.cursor = ''; // Reset cursor to default
    });
});
