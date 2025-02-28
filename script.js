mapboxgl.accessToken = 'pk.eyJ1IjoicGFuZXZhIiwiYSI6ImNtNXk0NXdiOTBhM3AyanIyNHR1OXBsejEifQ.gELzGrqRoZiEhabFwjVkiw'; 
import maptiler from '@maptiler/sdk';

// Initialize the map
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/paneva/cm79rht7d001k01s759d64q5s',
    center: [-0.19, 51.505],
    zoom: 11,
    interactive: false
});

map.on('load', function() {
    // Set global light properties which influence 3D layer shadows
    // map.setLight({color: "#fff", intensity: 0.25, position: [1.15, 210, 30]});
    // Add standard navigation control
    // map.addControl(new mapboxgl.NavigationControl());

    map.addLayer({ // This is the layer which is triggerered on hover on the place circle
        id: 'places_points_highlight',
        type: 'circle',
        source: {
            type: 'vector',
            url: 'mapbox://paneva.7kk3aqaa' //Tileset ID
        },
        'source-layer': 'places_wgs84-7ujhxl',
        layout: {
            'visibility': 'visible'
        },
        paint: {
            'circle-color': '#adf',
            'circle-opacity': 0.5,
            'circle-stroke-width': 4,
            'circle-stroke-color': '#ff0000',
            'circle-stroke-opacity': 0,
            'circle-radius': 4,
        }
    });

    map.addLayer({ //This is the layer with places as little circles
        id: 'places_points_hover_reaction',
        type: 'circle',
        source: {
            type: 'vector',
            url: 'mapbox://paneva.7kk3aqaa' //Tileset ID
        },
        'source-layer': 'places_wgs84-7ujhxl',
        layout: {
            'visibility': 'visible'
        },
        paint: {
            'circle-color': '#fffef7',
            'circle-opacity': 0,
            'circle-radius': 10,
        }
    });

    map.addLayer({ //This is the layer with places as little circles
        id: 'places_points',
        type: 'circle',
        source: {
            type: 'vector',
            url: 'mapbox://paneva.7kk3aqaa' //Tileset ID
        },
        'source-layer': 'places_wgs84-7ujhxl',
        layout: {
            'visibility': 'visible'
        },
        paint: {
            'circle-color': '#fffef7',
            'circle-opacity': 0.5,
            'circle-stroke-width': {
                stops: [[8, 0.5], [13, 3], [16, 4]]
            },
            'circle-stroke-color': '#000',
            'circle-stroke-opacity': 1,
            'circle-radius': 1,
        }
    });

    map.addLayer({
        id: 'capital_ring_line',
        type: 'line',
        source: {
            type: 'vector',
            url: 'mapbox://paneva.b928rme1' //Tileset ID
        },
        'source-layer': 'CR_reproject_simplified_smoot-5yslyh',
        layout: {
            'visibility': 'visible',
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': '#ff0000', // Red color
            'line-width': 4, // Thickness
            'line-opacity': 0.8
        }
    });

    // Create a popup, but don't add it to the map yet.
    var place_name_popup = new AnimatedPopup({
        closeButton: false,
        closeOnClick: false,
        offset: 10,
        anchor: 'right',
        openingAnimation: {
            duration: 250,
            easing: 'easeInOutBack',
            transform: 'scale',
        },
        closingAnimation: {
            duration: 250,
            easing: 'easeInBack',
            transform: 'scale',
        },
        className: 'place-name-popup'
    }); 

    // Create category popup - number 1
    var place_category_popup_1 = new AnimatedPopup({
        offset:[-100,40],
        closeButton: false,
        class: 'category_popup'
    });
    // Create category popup - number 2
    var place_category_popup_2 = new AnimatedPopup({
        offset:[-100,80],
        closeButton: false,
        class: 'category_popup'
    });
    // Create category popup - number 3
    var place_category_popup_3 = new AnimatedPopup({
        offset:[-100,120],
        closeButton: false,
        class: 'category_popup'
    });

map.on('mouseenter', 'places_points_hover_reaction', function (e) {

    // Get the feature that the mouse entered
    var place = e.features[0];  // 'features' array contains the map features under the cursor

    if (place) {
        var coordinates = place.geometry.coordinates.slice();
        // var description = "<h2>" + place.properties['GAZETTEER_ENTRY.NAME1'] + "</h2>";
        // var category_1 = "<h3 style='color: red; font-size: 12px;'>" + place.properties['place_categories'] + "</h3>";
            // Example: Future-proofing for three category lines
        var category_1 = "<div class='category_popup' id='cat1'>" + "green" + "</div>";
        var category_2 = "<div class='category_popup' id='cat2'>" + "royal" + "</div>";
        var category_3 = "<div class='category_popup' id='cat3'>" + "exquisite" + "</div>";
        var placeName = place.properties['GAZETTEER_ENTRY.NAME1'];
        
        // <div class="place-parent-container">
        //     <div class="place-name-container">
        //         <div class="place-name-popup">{{placeName}}</div>
        //         <div class="place-name-line"></div>
        //     </div>

        //     <div class="category-container">
        //         <div class="category_popup">{{category_1}}</div>
        //         <div class="category_popup">{{category_2}}</div>
        //         <div class="category_popup">{{category_3}}</div>
        //     </div>

        // </div>

        // var popupContainer = document.createElement("div");
        // popupContainer.classList.add("place-name-container");
        
        // var popupText = document.createElement("div");
        // popupText.classList.add("place-name-popup");
        // popupText.textContent = placeName;
        
        // var popupLine = document.createElement("div");
        // popupLine.classList.add("place-name-line");
        
        // popupContainer.appendChild(popupText);
        // popupContainer.appendChild(popupLine);
        
            // Dynamic HTML
        var popupContainer = document.createElement("div");
        popupContainer.classList.add("place-name-container");

        var popupText = document.createElement("div");
        popupText.classList.add("place-name-popup");
        popupText.textContent = placeName;

        var popupLine = document.createElement("div");
        popupLine.classList.add("place-name-line");

        popupContainer.appendChild(popupText);
        popupContainer.appendChild(popupLine);

        var categoryContainer = document.createElement("div");
        categoryContainer.classList.add("category-container");
        categoryContainer.innerHTML = category_1 + category_2 + category_3;

        var placeParentContainer = document.createElement("div");
        placeParentContainer.classList.add("place-parent-container");
        placeParentContainer.appendChild(popupContainer);
        placeParentContainer.appendChild(categoryContainer);

        // Add to the popup
        place_name_popup.setLngLat(coordinates)
            .setDOMContent(placeParentContainer)
            .addTo(map);

        // Apply animation delay
        setTimeout(() => document.getElementById('cat1').classList.add('show'), 200);
        setTimeout(() => document.getElementById('cat2').classList.add('show'), 400);
        setTimeout(() => document.getElementById('cat3').classList.add('show'), 600);


        // Change the cursor and apply the highlight filter
        map.getCanvas().style.cursor = 'pointer';
        map.setFilter('places_points_highlight', ['==', 'GAZETTEER_ENTRY.NAME1', place.properties['GAZETTEER_ENTRY.NAME1']]);
        // Set circle-stroke-opacity to 1 for the highlighted features
        map.setPaintProperty('places_points_highlight', 'circle-stroke-opacity', 1);
    }
});

map.on('mouseleave', 'places_points_hover_reaction', function (e) {
    place_name_popup.remove();  // Remove the place name popup
    place_category_popup_1.remove();  // Remove the place name popup
    place_category_popup_2.remove();  // Remove the place name popup
    place_category_popup_3.remove();  // Remove the place name popup
    // Reset the highlight filter and cursor
    map.setFilter('places_points_highlight', ['==', 'GAZETTEER_ENTRY.NAME1', 'null']);
    map.getCanvas().style.cursor = '';  // Reset the cursor
});

});

