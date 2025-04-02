//let bg= "#191C1A";
let bg = "#DADADA";
let canvaHeight=900;

function setup() {
  let boardCanvas = createCanvas(windowWidth-20, canvaHeight);
  boardCanvas.parent("canva");
  background(bg);

  console.log("canva setup");
}

function windowResized(){
  resizeCanvas(windowWidth-20, canvaHeight);
  // Resize the canvas when the window is resized
  background(bg);
}

function draw() {
  background(220);
}
