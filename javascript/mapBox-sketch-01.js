var mapboxSketch = function() {
    // Set your Mapbox access token
    mapboxgl.accessToken = 'pk.eyJ1IjoiamhsZWU5NTQyNCIsImEiOiJjbXJ3aHZtMDMwNHQ2MzVvbmJtMDAwNGNoIn0.xMXUOPBlO8ECCgjceMVfdA';

    //Create map object
    const map = new mapboxgl.Map({
        container: 'mapbox-container-1',
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-73.9857, 40.7484], // Longitude, Latitude (New York City)
        zoom: 12
    });

    // Add navigation controls to the map
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.addControl(new mapboxgl.FullscreenControl(), 'top-right');
    map.addControl(new mapboxgl.ScaleControl({
        maxWidth: 80,
        unit: 'metric'
    }), 'bottom-left');

    // Add a marker to the map
    map.on('load', () => {
        console.log('Map has loaded');
        const marker = new mapboxgl.Marker()
            .setLngLat([-73.9857, 40.7484]) // Marker position (New York City)
            .addTo(map);
    });
};
