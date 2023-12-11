// Initialize the Leaflet map
var nguyenTrungTruc = L.latLngBounds(
  [21.045001, 105.846156],
  [21.039919, 105.847561]
);

// Initialize the map with custom settings
var map = L.map("map", {
  maxBounds: nguyenTrungTruc,
  maxBoundsViscosity: 1.0,
  center: [21.041947, 105.8473907],
  zoom: 25,
  minZoom: 17,
});

// Add a base map layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// ------------------------------------------------------------------------ //
class Node {
  constructor(id, lat, lon) {
    this.id = id;
    this.lat = lat;
    this.lon = lon;
  }
}

var NodeList = [];
var Edges = [];

var startPoint = new Node(-1, -1, -1);
var endPoint = new Node(-1, -1, -1);

var startNode = new Node(-1, -1, -1);
var endNode = new Node(-1, -1, -1);
// ------------------------------------------------------------------------ //
function drawPoint(node, radius = 0.5) {
  L.circle([node.lat, node.lon], radius).addTo(map);
}

function drawSegment(from, to, c = "red", w = 3, o = 0.7, sF = 1) {
  var pointA = new L.LatLng(from.lat, from.lon);
  var pointB = new L.LatLng(to.lat, to.lon);
  var pointList = [pointA, pointB];

  L.polyline(pointList, {
    color: c,
    weight: w,
    opacity: o,
    smoothFactor: sF,
  }).addTo(map);
}

function dist(item1, item2) {
  return Math.sqrt(
    Math.pow(item1.lat - item2.lat, 2) + Math.pow(item1.lon - item2.lon, 2)
  );
}

function getNearestNode(node) {
  var min_d = dist(node, getNodeById(Edges[0][0]));
  var index = 0;
  var ps = 0;
  for (let i = 0; i < Edges.length; i++) {
    for (let j = 0; j < 2; j++) {
      if (dist(node, getNodeById(Edges[i][j])) < min_d) {
        min_d = dist(node, getNodeById(Edges[i][j]));
        index = i;
        ps = j;
      }
    }
  }
  return getNodeById(Edges[index][ps]);
}

function getNodeById(id) {
  for (let i = 0; i < NodeList.length; i++) {
    if (NodeList[i].id == id) return NodeList[i];
  }
  return null;
}
// ------------------------------------------------------------------------ //
var xmlDoc;
const xmlFile = "map.xml";
if (typeof window.DOMParser != "undefined") {
  xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", xmlFile, false);
  if (xmlhttp.overrideMimeType) {
    xmlhttp.overrideMimeType("text/xml");
  }
  xmlhttp.send();
  xmlDoc = xmlhttp.responseXML;
} else {
  xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
  xmlDoc.async = "false";
  xmlDoc.load(xmlFile);
}
// ------------------------------------------------------------------------ //
var nodes = xmlDoc.getElementsByTagName("node");
for (let i = 0; i < nodes.length; i++) {
  const node = nodes[i];
  const id = node.id;
  const lat = node.attributes[7].nodeValue;
  const lon = node.attributes[8].nodeValue;
  NodeList.push(new Node(id, lat, lon));
}

var edges = xmlDoc.getElementsByTagName("way");
for (let i = 0; i < edges.length; i++) {
  var checked = true;
  var tags_in_way = edges[i].getElementsByTagName("tag");

  for (let k = 0; k < tags_in_way.length; k++) {}

  if (checked) {
    var nodes_in_way = edges[i].getElementsByTagName("nd");
    for (let j = 1; j < nodes_in_way.length; j++) {
      Edges.push([
        nodes_in_way[j - 1].attributes[0].nodeValue,
        nodes_in_way[j].attributes[0].nodeValue,
      ]);
    }
  }
}
// ------------------------------------------------------------------------ //
L.circle([21.0431555, 105.8471399], 1).addTo(map);
L.circle([21.0432116, 105.8468183], 1).addTo(map);
L.circle([21.0434219, 105.8456115], 1).addTo(map);

drawSegment(
  new Node(0, 21.0431555, 105.8471399),
  new Node(0, 21.0432116, 105.8468183)
);
// ------------------------------------------------------------------------ //
// Add event refresh points for button click
document.getElementById("refreshButton").addEventListener("click", function(event) {
  event.stopPropagation();

  startPoint = new Node(-1, -1, -1);
  endPoint = new Node(-1, -1, -1);
  startNode = new Node(-1, -1, -1);
  endNode = new Node(-1, -1, -1); 
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker || layer instanceof L.Polyline) {
       layer.remove();
    }
  });
});

// Add event listener for map click
map.on("click", function (e) {
  if (startPoint.lat != -1 && endPoint.lat != -1) return;
  if (startPoint.lat == -1) {
    startPoint.lat = e.latlng.lat;
    startPoint.lon = e.latlng.lng;
    startPoint = getNearestNode(startPoint);

    L.marker([startPoint.lat, startPoint.lon])
      .bindPopup("From")
      .openPopup()
      .addTo(map);
  } else if (endPoint.lat == -1) {
    endPoint.lat = e.latlng.lat;
    endPoint.lon = e.latlng.lng;
    endPoint = getNearestNode(endPoint);

    L.marker([endPoint.lat, endPoint.lon])
      .bindPopup("To")
      .openPopup()
      .addTo(map);
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
    [21.040668, 105.85],
    [21.040863, 105.850244],
    [21.044948, 105.846164],
  ];

  var polyline = L.polyline(polylinePoints, {
    color: "red",
    dashArray: "5, 5",
    opacity: 0.7,
  }).addTo(map);
}

document.addEventListener("DOMContentLoaded", function () {
  initMap();

  for (let i = 0; i < Edges.length; i++) {
    var node0 = getNodeById(Edges[i][0]);
    var node1 = getNodeById(Edges[i][1]);
    if (node0 != null && node1 != null) drawSegment(node0, node1);
  }
});
