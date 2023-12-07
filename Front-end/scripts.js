// Initialize the Leaflet map
var nguyenTrungTruc = L.latLngBounds([21.045001, 105.846156], [21.039919, 105.847561]);

// Initialize the map with custom settings
var map = L.map('map', {
  maxBounds: nguyenTrungTruc,
  maxBoundsViscosity: 1.0,
  center: [21.041947, 105.847218],
  zoom: 17,
  minZoom: 13,
});

// Add a base map layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Add a marker for P.Nguyen Trung Truc, Hanoi
L.marker([21.041947, 105.847218]).addTo(map)
  .bindPopup("P.Nguyen Trung Truc, Hanoi").openPopup();

// Add a popup show coordinates when click on map
var popup = L.popup();
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}
map.on('click', onMapClick);

  // Add event listener for map click to update input values
map.on('click', function (e) {
  var startInput = document.getElementById('start-input');
  var destinationInput = document.getElementById('destination-input');

  if (startInput === document.activeElement) {
    startInput.value = e.latlng.lat + ', ' + e.latlng.lng;
  } else if (destinationInput === document.activeElement) {
    destinationInput.value = e.latlng.lat + ', ' + e.latlng.lng;
  }
});

// Create a border around the area
function initMap() {
  var polylinePoints = [
    [21.044948, 105.846164],
    [21.043853, 105.845809],
    [21.043825, 105.845518],
    [21.042426, 105.845311],
    [21.042141, 105.845083],
    [21.041926, 105.844719],
    [21.041564, 105.844602],
    [21.041345, 105.844507],
    [21.041151, 105.844735],
    [21.041255, 105.845052],
    [21.040525, 105.846136],
    [21.040474, 105.846558],
    [21.040689, 105.847101],
    [21.039978, 105.847558],
    [21.040668, 105.850000],
    [21.040863, 105.850244],
    [21.044948, 105.846164],
    ];

  var polyline = L.polyline(polylinePoints, { 
    color: 'red',
    dashArray: '5, 5',
    opacity: 0.7
  }).addTo(map);
}
  document.addEventListener('DOMContentLoaded', function() {
  initMap();
  });