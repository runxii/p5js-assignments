let width = 800;
let height = 600;
let img;

let displaceColors;

let displaceColorsSrc = `
precision highp float;

uniform sampler2D tex0;
varying vec2 vTexCoord;

vec2 zoom(vec2 coord, float amount) {
  vec2 relativeToCenter = coord - 0.5;
  relativeToCenter /= amount; // Zoom in
  return relativeToCenter + 0.5; // Put back into absolute coordinates
}

void main() {
  // Get each color channel using coordinates with different amounts
  // of zooms to displace the colors slightly
  gl_FragColor = vec4(
    texture2D(tex0, vTexCoord).r,
    texture2D(tex0, zoom(vTexCoord, 1.05)).g,
    texture2D(tex0, zoom(vTexCoord, 1.1)).b,
    texture2D(tex0, vTexCoord).a
  );
}
`;

function label(text) {
  let labelDiv = document.getElementById("filter-label"); // Get the div by ID
  if (labelDiv) {
    labelDiv.innerHTML = "Filter: " + text; // Update the text inside the div
  } else {
    console.warn("Element with id='filter-label' not found."); // Debugging if the element doesn't exist
  }
}

function setup() {
  let boardCanvas = createCanvas(width,height);
  boardCanvas.parent("board");
  toolbar = new toolBar();
  displaceColors = createFilterShader(displaceColorsSrc);
}

function draw() {
  if(img){
    image(img, 0, 0, width, height, 0, 0, img.width, img.height,CONTAIN, CENTER);
  }
  if (key === "1") { 
    filter(INVERT);
    label("INVERT");
  } else if (key === "2") { 
    filter(THRESHOLD);
    label("THRESHOLD");
  } else if (key === "3") { 
    filter(GRAY);
    label("GRAY");
  } else if (key === "4") { 
    filter(DILATE);
    label("DILATE");
  } else if (key === "5") { 
    filter(ERODE);
    label("ERODE");
  } else if (key === "6") {
    filter(POSTERIZE, 2);
    label("POSTERIZE 2");
  } else if (key === "7") {
    filter(POSTERIZE, 4);
    label("POSTERIZE 4");
   } else if (key === "8") { 
    filter(BLUR, 3);
    label("BLUR 3");
  }  else if (key === "9") { 
    filter(BLUR, 12);
    label("BLUR 12");
  } else if (key === "0") {
    filter(displaceColors);
    label("COLORDISPLACED")
  }
}

function handleFile(file) {
  if (file.type === 'image') {
    img = loadImage(file.data, () => {
      image(img, 0, 0, width, height, 0, 0, img.width, img.height, CONTAIN, CENTER); // Display image on canvas
    });
  } else {
    img = null;
  }
}

function toolBar() {
  // import the image
  let input = createFileInput(handleFile); // Create file input
  input.style('display','none'); // Hide the ordinary upload button
  input.parent("import");
  select("#import").mouseClicked(() => input.elt.click()); // Corrected function
}

function keyTyped() {
  // save the image
  if(key==='s'){
    saveCanvas('img', 'png');
  }
  // reset the canvas
  if(key==='r'){
    clear();
  }
}
