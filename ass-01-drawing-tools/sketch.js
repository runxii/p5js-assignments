var tools = null;
var brushes = null;
var toolCode;
let bg = 255;
let colorpicker;
let weightSelected;
let img;

function setup() {
  let boardCanvas = createCanvas(windowWidth*0.8, windowHeight*0.8);
  boardCanvas.parent("board");
  background(bg);

  brushes = new brushFunction();
  tools = new toolFunction();
  // weights = new weightFunction();
  // import image
}

function windowResized(){
  resizeCanvas(windowWidth*0.8, windowHeight*0.8);
  background(bg);
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

// Brush Settings
// let brushSize = 15;
let f = false;
let spring = 0.4;  // Spring constant (higher means stronger pull)
let friction = 0.45; // Friction (lower means more slippery)
let v = 0.5;
let r = 0;
let vx = 0, vy = 0;
let splitNum = 100; // Number of subdivisions between points
let diff = 2; // Misalignment factor
let x, y, oldX, oldY, oldR;
// pencil settings
let pencilOpacity = 80;  // Pencil opacity
let pencilWeight = 1;  // Base stroke weight
let jitterAmount = 2;  // Random variation
// marker settings
let markerOpacity = 10; // Semi-transparent ink
let markerWidth = 25; // Marker width
let markerHeight = 8; // Marker height


function draw() {

  //brushes
  let colorSelected = colorpicker.value();
  switch (toolCode) {
    case 0:
      brushSize = weightSelected;
      if (mouseIsPressed) {
        stroke(colorSelected);
        drawBrushStroke(pmouseX, pmouseY, mouseX, mouseY);
      } else if (f) {
        vx = vy = 0;
        f = false;
      }
      break;
    case 1: // eraser
      if(mouseIsPressed){
        stroke(colorSelected);
        stroke(bg);
        strokeWeight(weightSelected);
        line(mouseX,mouseY,pmouseX,pmouseY);
      } 
      break;
    case 2: // pencil
      if(mouseIsPressed){
        stroke(colorSelected);
        //strokeWeight(1);
        //line(mouseX,mouseY,pmouseX,pmouseY);
        drawPencilStroke(pmouseX, pmouseY, mouseX, mouseY);
      }
      break;
    case 3: // marker
      markerHeight = weightSelected;
      if(mouseIsPressed){
        drawMarker(pmouseX, pmouseY, mouseX, mouseY, colorSelected);
      }
      break;
    default:
      weightSelected = 1;
  }
  select("#weight-show").html(weightSelected);
  select('#color-show').style('background-color',colorSelected);
}

// Function to draw the brush stroke between two points
function drawBrushStroke(x1, y1, x2, y2) {
  if (!f) {
    f = true;
    x = x1;
    y = y1;
  }

  vx += (x2 - x) * spring;
  vy += (y2 - y) * spring;
  vx *= friction;
  vy *= friction;

  v += sqrt(vx * vx + vy * vy) - v;
  v *= 0.55;

  oldR = r;
  r = brushSize - v;
  
  for (let i = 0; i < splitNum; ++i) {
    oldX = x;
    oldY = y;
    x += vx / splitNum;
    y += vy / splitNum;
    oldR += (r - oldR) / splitNum;
    if (oldR < 1) oldR = 1;

    // Main stroke
    strokeWeight(oldR + diff);
    line(x + random(0, 2), y + random(0, 2), oldX + random(0, 2), oldY + random(0, 2));

    // Additional texture for realistic effect
    strokeWeight(oldR);
    line(x + diff * random(0.1, 2), y + diff * random(0.1, 2), oldX + diff * random(0.1, 2), oldY + diff * random(0.1, 2));
    line(x - diff * random(0.1, 2), y - diff * random(0.1, 2), oldX - diff * random(0.1, 2), oldY - diff * random(0.1, 2));
  }
}

function drawPencilStroke(x1, y1, x2, y2) {
  let steps = dist(x1, y1, x2, y2) * 2; // More steps for smoothness
  
  for (let i = 0; i < steps; i++) {
    let t = i / steps;
    let x = lerp(x1, x2, t) + random(-jitterAmount, jitterAmount);
    let y = lerp(y1, y2, t) + random(-jitterAmount, jitterAmount);
    
    strokeWeight(pencilWeight * random(0.8, 1.2));
    stroke(0, random(pencilOpacity * 0.5, pencilOpacity)); // Vary opacity
    point(x, y); // Simulate rough texture using points
  }
}

function drawMarker(x1, y1, x2, y2, color) {
  let steps = dist(x1, y1, x2, y2) * 2; // Ensure smooth interpolation
  
  for (let i = 0; i < steps; i++) {
    let t = i / steps;
    let x = lerp(x1, x2, t) + random(-jitterAmount, jitterAmount);
    let y = lerp(y1, y2, t) + random(-jitterAmount, jitterAmount);
    
    let angle = atan2(y2 - y1, x2 - x1); // Get stroke direction
    drawMarkerTip(x, y, angle, color);
  }
}

function drawMarkerTip(x, y, angle, color) {
  push();
  translate(x, y);
  rotate(angle);
  noStroke();
  fill(color+markerOpacity); // Semi-transparent blue ink
  rectMode(CENTER);
  rect(0, 0, markerWidth, markerHeight);
  pop();
}

function brushFunction(){
  select('#brush-tool').mouseClicked(function(){
    toolCode = 0;
    console.log(toolCode,'brush selected',weightSelected,'px');
  });
  select('#eraser-tool').mouseClicked(function(){
    toolCode = 1;
    console.log(toolCode,'eraser selected',weightSelected,'px');
  });
  select('#pencil-tool').mouseClicked(function(){
    toolCode = 2;
    console.log(toolCode,'pencil selected',weightSelected,'px');
  });
  select('#marker-tool').mouseClicked(function(){
    toolCode = 3;
    console.log(toolCode,'marker selected',weightSelected,'px');
  });
}

// hotkey settings
function keyTyped(){
  if (key == 'c'){
    // (c)lear, set the rect to white.
    background(bg);
  }
  if (key == 's'){
    saveCanvas("myDrawing","jpg");
  }
  if (key == '2' && weightSelected <100){
    weightSelected+=1;
    console.log('stroke weight', weightSelected);
  }
  if (key == '1' && weightSelected >1){
    weightSelected-=1;
    console.log('stroke weight', weightSelected);
  }
}

function toolFunction(){

  select("#clear-tool").mouseClicked(function(){
    background(bg);
    console.log('canvas cleared');
  });

  select("#save-tool").mouseClicked(function() {
		saveCanvas("myDrawing", "jpg");
    console.log('file saved');
	});

  let input = createFileInput(handleFile); // Create file input
  input.style('display','none'); // Hide the ordinary upload button
  input.parent("image-tool");
  select("#image-tool").mouseClicked(() => input.elt.click()); // Corrected function

  // color eye picker settings
  colorpicker = createColorPicker('#000000');
  colorpicker.style('display','none');
  select("#color-tool").mouseClicked(() => colorpicker.elt.click());

  select("#weight-down").mouseClicked(function() {
    if(weightSelected>1){
      weightSelected -=1;
    }
    console.log('stroke weight', weightSelected);
  });
  select("#weight-up").mouseClicked(function(){
    if(weightSelected<100){
      weightSelected +=1;
    }
    console.log('stroke weight', weightSelected);
  });
}