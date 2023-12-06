// Initialize the Leaflet map
var hoanKiemBounds = L.latLngBounds([21.0208, 105.8422], [21.0338, 105.8581]);

// Initialize the map with custom settings
var map = L.map('map', {
  maxBounds: hoanKiemBounds,
  maxBoundsViscosity: 1.0,
  center: [21.0278, 105.8497],
  zoom: 16,
  minZoom: 16
});

// Add a base map layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Add a marker for Hoan Kiem Ward, Hanoi
L.marker([21.0285, 105.8501]).addTo(map)
  .bindPopup("Hoan Kiem Ward, Hanoi").openPopup();

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
