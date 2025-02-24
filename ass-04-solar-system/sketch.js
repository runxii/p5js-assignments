// Speed of planetary movement
let speed = 0.002;

// Light source properties
let lightColor;     // Color of the light
let lightLocation;  // Position of the light source

// Sun properties
let sunRadius = 20; // Radius of the sun

// Planets properties
let planets = [];   // Array to store planet objects
let numOfPlanets = 6; // Number of planets in the system
let minPlanetRadius = 3;  // Minimum planet size
let maxPlanetRadius = 15; // Maximum planet size

// Stars properties
let stars = [];     // Array to store stars in the background
let numOfStars = 200; // Number of background stars

// Canvas dimensions
let width = 800;
let height = 600;

function setup() {
  createCanvas(width, height, WEBGL); // Create a 3D canvas using WEBGL mode
  createLights();  // Initialize light properties
  createPlanets(); // Generate planet objects
  createStars();   // Generate background stars
}

function draw() {
  background(0); // Set background to black (space)
  
  push(); // Save transformation state
  locateCamera(); // Adjust the camera position
  drawLights();   // Render lighting
  drawSun();      // Draw the central sun
  drawOrbits();   // Draw planetary orbits
  drawPlanets();  // Render all planets
  pop(); // Restore transformation state
}

// Adjust camera position and angle for better viewing
function locateCamera() {
  translate(0, -height / 8, 0); // Shift view slightly up
  rotateX(PI * 0.3); // Tilt the view for a better perspective
}

// Initialize light properties
function createLights() {
  lightColor = color(255); // Set light to white
  lightLocation = createVector(width, height, -100); // Light position in 3D space
}

// Set up ambient and directional lighting
function drawLights() {
  ambientLight(100); // Soft global light
  directionalLight(lightColor, lightLocation); // Light from a specific direction
}

// Create planets and store them in an array
function createPlanets() {
  for (let i = 0; i < numOfPlanets; i++) {
    planets.push(new Planet()); // Create a new Planet object and add it to the array
  }
}

// Loop through the planets array and render each one
function drawPlanets() {
  for (let planet of planets) {
    planet.drawPlanet();
  }
}

// Loop through the planets array and draw their orbits
function drawOrbits() {
  for (let planet of planets) {
    planet.drawOrbit();
  }
}

// Draw the sun at the center of the system
function drawSun() {
  noStroke(); // Remove outline
  fill(254, 184, 19); // Set sun color (yellow-orange)
  sphere(sunRadius); // Render the sun as a sphere
}

// Generate background stars and store their positions in an array
function createStars() {
  for (let i = 0; i < numOfStars; i++) {
    let point = [];
    point[0] = random(-width / 2, width / 2); // Random X position in space
    point[1] = random(-height / 2, height / 2); // Random Y position in space
    stars.push(point); // Add the star's position to the array
  }
}