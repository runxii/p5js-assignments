let width = 800;
let height = 600;
let img;

function setup() {
  createCanvas(width,height);
  toolbar = new toolBar();
}

function draw() {
  background(255);
  if(img){
    image(img, 0, 0, width, height, 0, 0, img.width, img.height, CONTAIN, CENTER);
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
  }
}

function label(s) {
  fill(0);
  rectMode(CENTER);
  rect(width/2, height - 20, 120, 20);
  textAlign(CENTER, CENTER);
  fill(255);
  textSize(16);
  text(s, width/2, height - 20);
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
  input.parent("image-tool");
  select("#image-tool").mouseClicked(() => input.elt.click()); // Corrected function
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
