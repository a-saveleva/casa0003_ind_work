import * as maptilersdk from '@maptiler/sdk';
maptilersdk.config.apiKey = import.meta.env.VITE_MAPTILER_API_KEY;
import { MaplibreLegendControl } from '@watergis/maplibre-gl-legend';


var map = new maptilersdk.Map({
    container: 'map',
    style: `https://api.maptiler.com/maps/916f2464-4680-4f1c-9514-86c90aa48edc/style.json?key=${maptilersdk.config.apiKey}`,
    center: [-0.17, 51.501],
    zoom: 11,
    interactive: false
});

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
    var category_1 = place.properties?.category_headline_1 || ''; 
    var category_2 = place.properties?.category_headline_2 || '';
    var category_3 = place.properties?.category_headline_3 || '';

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

map.on('load', async function () {
    const geojson_places = await maptilersdk.data.get('4d4fddec-5d63-41b6-8ef8-db4dfee81da1');
    console.log(map.getStyle().layers);

    const targets = {
        PlacesPoints: "Places along the route",
        CapitalRing: "Capital Ring route",
    };

    const categories = Object.keys(targets).map(key => {
        let color = '#000000'; // Default color if not found
        const layer = map.getLayer(key); // Get layer by name

        // Ensure the layer exists
        if (layer && layer.paint) {
            // Extract color based on the layer's type
            if (layer.type === 'circle' && layer.paint['circle-color']) {
                color = layer.paint['circle-color'];
            } else if (layer.type === 'line' && layer.paint['line-color']) {
                color = layer.paint['line-color'];
            } else if (layer.type === 'fill' && layer.paint['fill-color']) {
                color = layer.paint['fill-color'];
            }
        }

        return {
            name: targets[key], // Description from the targets object
            color: color, // Extracted color from MapTiler map
            icon: 'circle', // Use 'circle' icon, can be adjusted
        };
    });

    const options = {
        showDefault: true,
        showCheckbox: true,
        onlyRendered: true,
        reverseOrder: true
    };


    map.addControl(legend, 'bottom-left');

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
            'text-color': "#965B4A"
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
