// ------------------------------------------------------------------------ //
// ---------------                 Node class             ----------------- //
// ------------------------------------------------------------------------ //
class Node {
  constructor(id, lat, lon) {
    this.id = id;
    this.lat = lat;
    this.lon = lon;
  }
}

// ------------------------------------------------------------------------ //
// ---------------                 Edge class             ----------------- //
// ------------------------------------------------------------------------ //
class Edge {
  constructor(v, w) {
    this.v = v;
    this.w = w;
  }
}

// ------------------------------------------------------------------------ //
// ---------------               Distance class           ----------------- //
// ------------------------------------------------------------------------ //
class Distance {
  constructor(value, visited) {
    this.value = value;
    this.visited = visited;
  }
}

// ------------------------------------------------------------------------ //
// ---------------            PriorityQueue class         ----------------- //
// ------------------------------------------------------------------------ //
class PriorityQueue {
  constructor() {
    this.heap = [];
  }

  isEmpty() {
    if (this.heap.length == 0) return true;
    return false;
  }

  getLeftChildIndex(parentIndex) {
    return 2 * parentIndex + 1;
  }

  getRightChildIndex(parentIndex) {
    return 2 * parentIndex + 2;
  }

  getParentIndex(childIndex) {
    return Math.floor((childIndex - 1) / 2);
  }

  hasLeftChild(index) {
    return this.getLeftChildIndex(index) < this.heap.length;
  }

  hasRightChild(index) {
    return this.getRightChildIndex(index) < this.heap.length;
  }

  hasParent(index) {
    return this.getParentIndex(index) >= 0;
  }

  leftChild(index) {
    return this.heap[this.getLeftChildIndex(index)];
  }

  rightChild(index) {
    return this.heap[this.getRightChildIndex(index)];
  }

  parent(index) {
    return this.heap[this.getParentIndex(index)];
  }

  swap(indexOne, indexTwo) {
    const temp = this.heap[indexOne];
    this.heap[indexOne] = this.heap[indexTwo];
    this.heap[indexTwo] = temp;
  }

  peek() {
    if (this.heap.length === 0) {
      return null;
    }
    return this.heap[0];
  }

  remove() {
    if (this.heap.length === 0) {
      return null;
    }
    const item = this.heap[0];
    this.heap[0] = this.heap[this.heap.length - 1];
    this.heap.pop();
    this.heapifyDown();
    return item;
  }

  add(item) {
    this.heap.push(item);
    this.heapifyUp();
  }

  heapifyUp() {
    let index = this.heap.length - 1;
    while (
      this.hasParent(index) &&
      this.parent(index)[0] > this.heap[index][0]
    ) {
      this.swap(this.getParentIndex(index), index);
      index = this.getParentIndex(index);
    }
  }

  heapifyDown() {
    let index = 0;
    while (this.hasLeftChild(index)) {
      let smallerChildIndex = this.getLeftChildIndex(index);
      if (
        this.hasRightChild(index) &&
        this.rightChild(index)[0] < this.leftChild(index)[0]
      ) {
        smallerChildIndex = this.getRightChildIndex(index);
      }
      if (this.heap[index][0] < this.heap[smallerChildIndex][0]) {
        break;
      } else {
        this.swap(index, smallerChildIndex);
      }
      index = smallerChildIndex;
    }
  }
}

// ------------------------------------------------------------------------ //
// ---------------       Initialize the Leaflet map       ----------------- //
// ------------------------------------------------------------------------ //
var maxB = L.latLngBounds([21.045001, 105.846156], [21.039919, 105.847561]);

var map = L.map("map", {
  maxBounds: maxB,
  maxBoundsViscosity: 1.0,
  center: [21.041947, 105.8473907],
  zoom: 17,
  minZoom: 17,
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// ------------------------------------------------------------------------ //
// ---------------             Global variables           ----------------- //
// ------------------------------------------------------------------------ //
const MAX_INT = 100000;
const DELAY = (ms) => new Promise((res) => setTimeout(res, ms));

var NodeList = [];
var EdgeList = [];
var StartNode = new Node(-1, -1, -1);
var EndNode = new Node(-1, -1, -1);
var ModeVisualize = false;
var StopLoop = false;
var Algorithm = 0;

// ------------------------------------------------------------------------ //
// ---------------              Helper functions          ----------------- //
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

function showAllPointAndSegemnt(nodeList, edgeList) {
  for (let i = 0; i < edgeList.length; i++) {
    var nodei = nodeList[i];
    for (let j = 0; j < edgeList[i].length; j++) {
      var nodej = nodeList[edgeList[i][j].v];
      drawSegment(nodei, nodej);
    }
  }
}

function refreshPoint() {
  StartNode = new Node(-1, -1, -1);
  EndNode = new Node(-1, -1, -1);
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      layer.remove();
    }
  });
}

function refreshSegemnt() {
  map.eachLayer((layer) => {
    if (layer instanceof L.Polyline) {
      layer.remove();
    }
  });
}

function refreshPointAndSegemnt() {
  refreshPoint();
  refreshSegemnt();
}

function dist(item1, item2) {
  return Math.sqrt(
    Math.pow(item1.lat - item2.lat, 2) + Math.pow(item1.lon - item2.lon, 2)
  );
}

function getNearestNode(node) {
  var min_d = dist(node, NodeList[0]);
  var index = 0;
  for (let i = 0; i < EdgeList.length; i++) {
    if (dist(node, NodeList[i]) < min_d) {
      min_d = dist(node, NodeList[i]);
      index = i;
    }
  }
  return NodeList[index];
}

function getNodeById(id) {
  for (let i = 0; i < NodeList.length; i++) {
    if (NodeList[i].id == id) return NodeList[i];
  }
  return null;
}

function getIndexByNodeId(nodeId) {
  for (let i = 0; i < NodeList.length; i++) {
    if (NodeList[i].id == nodeId) return i;
  }
  return null;
}

// ------------------------------------------------------------------------ //
// ---------------          Get data from map.xml         ----------------- //
// ------------------------------------------------------------------------ //
function getDataXml(xmlFile) {
  var xmlDoc;
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

  return xmlDoc;
}

function getDataNodes(xmlDoc) {
  var nodeList = [];

  var nodes = xmlDoc.getElementsByTagName("node");
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const id = node.id;
    const lat = node.attributes[7].nodeValue;
    const lon = node.attributes[8].nodeValue;
    nodeList.push(new Node(id, lat, lon));
  }

  return nodeList;
}

function getDataEdges(xmlDoc) {
  var edgeList = [];

  var nodes = xmlDoc.getElementsByTagName("node");
  for (let i = 0; i < nodes.length; i++) {
    edgeList.push([]);
  }

  var ways = xmlDoc.getElementsByTagName("way");
  for (let i = 0; i < ways.length; i++) {
    var nodes_in_way = ways[i].getElementsByTagName("nd");
    for (let j = 1; j < nodes_in_way.length; j++) {
      var id0 = nodes_in_way[j - 1].attributes[0].nodeValue;
      var id1 = nodes_in_way[j].attributes[0].nodeValue;
      var w = dist(getNodeById(id0), getNodeById(id1));
      var u = getIndexByNodeId(id0);
      var v = getIndexByNodeId(id1);
      edgeList[u].push(new Edge(v, w));
      edgeList[v].push(new Edge(u, w));
    }
  }

  return edgeList;
}

// ------------------------------------------------------------------------ //
// ---------------          Dijkstra's algorithm          ----------------- //
// ------------------------------------------------------------------------ //
async function drawPath_Dijkstra(
  start,
  end,
  nodeList,
  edgeList,
  mode = false,
  timeDelay = 20
) {
  var prev = [];
  for (let i = 0; i < nodeList.length; i++) prev.push(-1);

  let distances = [];
  for (let i = 0; i < nodeList.length; i++) {
    distances.push(new Distance(MAX_INT, false));
  }

  distances[getIndexByNodeId(start.id)].value = 0;
  var pq = new PriorityQueue();
  pq.add([0, getIndexByNodeId(start.id)]);

  while (!pq.isEmpty() && !StopLoop) {
    let u = pq.remove()[1];
    distances[u].visited = true;

    for (let i = 0; i < edgeList[u].length; i++) {
      var e = edgeList[u][i];
      if (
        !distances[e.v].visited &&
        distances[u].value + e.w < distances[e.v].value
      ) {
        distances[e.v].value = distances[u].value + e.w;
        pq.add([distances[e.v].value, e.v]);
        prev[e.v] = u;

        if (mode == true) {
          await DELAY(timeDelay);
          drawSegment(nodeList[u], nodeList[e.v]);
        }
      }
    }
  }

  if (mode == true) {
    await DELAY(timeDelay * 100);
    refreshSegemnt();
  }

  var path = [];
  var u = getIndexByNodeId(end.id);
  while (u != -1) {
    path.push(nodeList[u]);
    u = prev[u];
  }
  for (let i = 1; i < path.length; i++) {
    drawSegment(path[i - 1], path[i]);
  }
}

// ------------------------------------------------------------------------ //
// ---------------             BFS's algorithm            ----------------- //
// ------------------------------------------------------------------------ //
async function drawPath_BFS(
  start,
  end,
  nodeList,
  edgeList,
  mode = false,
  timeDelay = 20
) {
  var prev = [];
  for (let i = 0; i < nodeList.length; i++) prev.push(-1);

  let distances = [];
  for (let i = 0; i < nodeList.length; i++) {
    distances.push(new Distance(MAX_INT, false));
  }

  distances[getIndexByNodeId(start.id)].value = 0;
  var pq = new PriorityQueue();
  pq.add([0, getIndexByNodeId(start.id)]);

  while (!pq.isEmpty() && !StopLoop) {
    let u = pq.remove()[1];
    distances[u].visited = true;

    for (let i = 0; i < edgeList[u].length; i++) {
      var e = edgeList[u][i];
      if (
        !distances[e.v].visited &&
        distances[u].value + e.w < distances[e.v].value
      ) {
        distances[e.v].value = distances[u].value + e.w;
        pq.add([distances[e.v].value, e.v]);
        prev[e.v] = u;

        if (mode == true) {
          await DELAY(timeDelay);
          drawSegment(nodeList[u], nodeList[e.v]);
        }
      }
    }
  }

  if (mode == true) {
    await DELAY(timeDelay * 100);
    refreshSegemnt();
  }

  var path = [];
  var u = getIndexByNodeId(end.id);
  while (u != -1) {
    path.push(nodeList[u]);
    u = prev[u];
  }
  for (let i = 1; i < path.length; i++) {
    drawSegment(path[i - 1], path[i]);
  }
}

// ------------------------------------------------------------------------ //
// ---------------             DFS's algorithm            ----------------- //
// ------------------------------------------------------------------------ //
async function drawPath_DFS(
  start,
  end,
  nodeList,
  edgeList,
  mode = false,
  timeDelay = 20
) {
  var prev = [];
  for (let i = 0; i < nodeList.length; i++) prev.push(-1);

  let distances = [];
  for (let i = 0; i < nodeList.length; i++) {
    distances.push(new Distance(MAX_INT, false));
  }

  distances[getIndexByNodeId(start.id)].value = 0;
  var pq = new PriorityQueue();
  pq.add([0, getIndexByNodeId(start.id)]);

  while (!pq.isEmpty() && !StopLoop) {
    let u = pq.remove()[1];
    distances[u].visited = true;

    for (let i = 0; i < edgeList[u].length; i++) {
      var e = edgeList[u][i];
      if (
        !distances[e.v].visited &&
        distances[u].value + e.w < distances[e.v].value
      ) {
        distances[e.v].value = distances[u].value + e.w;
        pq.add([distances[e.v].value, e.v]);
        prev[e.v] = u;

        if (mode == true) {
          await DELAY(timeDelay);
          drawSegment(nodeList[u], nodeList[e.v]);
        }
      }
    }
  }

  if (mode == true) {
    await DELAY(timeDelay * 100);
    refreshSegemnt();
  }

  var path = [];
  var u = getIndexByNodeId(end.id);
  while (u != -1) {
    path.push(nodeList[u]);
    u = prev[u];
  }
  for (let i = 1; i < path.length; i++) {
    drawSegment(path[i - 1], path[i]);
  }
}

// ------------------------------------------------------------------------ //
// ---------------          ASearch's algorithm          ----------------- //
// ------------------------------------------------------------------------ //
async function drawPath_ASearch(
  start,
  end,
  nodeList,
  edgeList,
  mode = false,
  timeDelay = 20
) {
  var prev = [];
  for (let i = 0; i < nodeList.length; i++) prev.push(-1);

  let distances = [];
  for (let i = 0; i < nodeList.length; i++) {
    distances.push(new Distance(MAX_INT, false));
  }

  distances[getIndexByNodeId(start.id)].value = 0;
  var pq = new PriorityQueue();
  pq.add([0, getIndexByNodeId(start.id)]);

  while (!pq.isEmpty() && !StopLoop) {
    let u = pq.remove()[1];
    distances[u].visited = true;

    for (let i = 0; i < edgeList[u].length; i++) {
      var e = edgeList[u][i];
      if (
        !distances[e.v].visited &&
        distances[u].value + e.w < distances[e.v].value
      ) {
        distances[e.v].value = distances[u].value + e.w;
        pq.add([distances[e.v].value, e.v]);
        prev[e.v] = u;

        if (mode == true) {
          await DELAY(timeDelay);
          drawSegment(nodeList[u], nodeList[e.v]);
        }
      }
    }
  }

  if (mode == true) {
    await DELAY(timeDelay * 100);
    refreshSegemnt();
  }

  var path = [];
  var u = getIndexByNodeId(end.id);
  while (u != -1) {
    path.push(nodeList[u]);
    u = prev[u];
  }
  for (let i = 1; i < path.length; i++) {
    drawSegment(path[i - 1], path[i]);
  }
}

// ------------------------------------------------------------------------ //
// ---------------       Choose an algorithm to route     ----------------- //
// ------------------------------------------------------------------------ //
async function drawPath(option = 0) {
  // option:
  //   0: Dijkstra (Default)
  //   1: BFS
  //   2: DFS
  //   3: A*
  if (option == 0) {
    await drawPath_Dijkstra(StartNode, EndNode, NodeList, EdgeList, ModeVisualize);
  } else if (option == 1) {
    await drawPath_BFS(StartNode, EndNode, NodeList, EdgeList, ModeVisualize);
  } else if (option == 2) {
    await drawPath_DFS(StartNode, EndNode, NodeList, EdgeList, ModeVisualize);
  } else if (option == 3) {
    await drawPath_ASearch(StartNode, EndNode, NodeList, EdgeList, ModeVisualize);
  }
}

// ------------------------------------------------------------------------ //
// ---------------              Event listener            ----------------- //
// ------------------------------------------------------------------------ //
// Add event select algorithm for button click
document
  .getElementById("listActionDiv")
  .addEventListener("click", function (event) {
    event.stopPropagation();
  });

// Add event select algorithm for button click
document.querySelectorAll("#dropdownItem a").forEach(function (item) {
  item.addEventListener("click", async function () {
    if (item.textContent == "Dijkstra") Algorithm = 0;
    else if (item.textContent == "Breadth First Search") Algorithm = 1;
    else if (item.textContent == "Depth First Search") Algorithm = 2;
    else if (item.textContent == "A* Search") Algorithm = 3;
    document.getElementById("algo").innerHTML = item.textContent;
    StopLoop = true;
    await DELAY(100);
    refreshPointAndSegemnt();
  });
});

// Add event visualization mode for button click
document
  .getElementById("visualizationButton")
  .addEventListener("click", function (event) {
    event.stopPropagation();
    ModeVisualize = !ModeVisualize;
    if (ModeVisualize)
      document.getElementById("visualizationButton").innerHTML =
        "Visualization mode: <strong>ON</strong>";
    else
      document.getElementById("visualizationButton").innerHTML =
        "Visualization mode: <strong>OFF</strong>";
  });

// Add event show all data for button click
document
  .getElementById("showDataButton")
  .addEventListener("click", function (event) {
    event.stopPropagation();
    showAllPointAndSegemnt(NodeList, EdgeList);
  });

// Add event refresh points for button click
document
  .getElementById("refreshButton")
  .addEventListener("click", async function (event) {
    event.stopPropagation();
    StopLoop = true;
    await DELAY(100);
    refreshPointAndSegemnt();
  });

// Add event listener for map click
map.on("click", async function (e) {
  if (StartNode.lat != -1 && EndNode.lat != -1) return;
  if (StartNode.lat == -1) {
    StopLoop = false;
    StartNode.lat = e.latlng.lat;
    StartNode.lon = e.latlng.lng;
    StartNode = getNearestNode(StartNode);

    L.marker([StartNode.lat, StartNode.lon])
      .bindPopup("From")
      .openPopup()
      .addTo(map);
  } else if (EndNode.lat == -1) {
    EndNode.lat = e.latlng.lat;
    EndNode.lon = e.latlng.lng;
    EndNode = getNearestNode(EndNode);

    L.marker([EndNode.lat, EndNode.lon]).bindPopup("To").openPopup().addTo(map);

    // Algorithm
    drawPath(Algorithm);
  }
});

// ------------------------------------------------------------------------ //
// ---------------             DOMContentLoaded           ----------------- //
// ------------------------------------------------------------------------ //
document.addEventListener("DOMContentLoaded", function () {
  var xmlData = getDataXml("map.xml");
  NodeList = getDataNodes(xmlData);
  EdgeList = getDataEdges(xmlData);
});
