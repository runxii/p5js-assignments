let table;
let country;
let region;
let income;
let health;
let population;
let totalCountries;
let width=1400;
let height=700;
let asia="#56b8cf";
let america="#fb9038";
let europe="#81eaa5";
let africa="#f9f871";
let oceania="#965692";
let axes;
let regionColors = {
  "ASIA (EX. NEAR EAST)" : asia,
  "EAST ASIA": asia,
  "NEAR EAST": asia,
  "NORTHERN AMERICA": america,
  "LATIN AMER. & CARIB": america,
  "WESTERN EUROPE": europe,
  "EASTERN EUROPE": europe,
  "BALTICS": europe,
  "C.W. OF IND. STATES": europe,
  "NORTHERN AFRICA": africa,
  "SUB-SAHARAN AFRICA": africa,
  "OCEANIA": oceania,
};

let legendColors = {
  "Asia": asia+'88',
  "America": america+'88',
  "Europe": europe+'88',
  "Africa": africa+'88',
  "Oceania": oceania+'88'
};

function preload() {
  table = loadTable('assets/health-income.csv', 'csv', 'header');
}

function setup() {
  createCanvas(width, height);

  totalCountries = table.getRowCount();
  country = table.getColumn('country');
  region = table.getColumn('region');
  income = table.getColumn('income');
  health = table.getColumn('health');
  population = table.getColumn('population');
}

function drawAxes() {
  // Add Labels
  textSize(16);
  fill(0);
  textAlign(CENTER, CENTER);
  text("Income", width / 2, height - 20); // X-axis label
  text("Health", 25, height / 2-20); // Y-axis label (rotated)
  
  stroke(0);
  strokeWeight(2);

  // Draw X-axis (Income)
  line(50, height - 50, width - 50, height - 50);
  
  // Draw Y-axis (Health)
  line(50, height - 50, 50, 50);
}

function drawGrid(lines) {
  stroke(200);
  strokeWeight(1);

  let yStep = (height - 100) / (lines - 1); // Equal spacing for Y

  textSize(12);
  fill(0);

  // Draw log-scaled X-axis
  for (let i = 0; i < lines; i++) {
    let incomeValue = exp(map(i, 0, lines - 1, Math.log(min(income)), Math.log(max(income)))); // Reverse logMap
    let x = logMap(incomeValue, min(income), max(income), 50, width - 50);
    
    line(x, 50, x, height - 50); // Vertical grid lines for income
    textAlign(CENTER);
    text(int(incomeValue), x, height - 35); // Display income values
  }

  // Draw linear Y-axis
  for (let i = 0; i < lines; i++) {
    let healthValue = map(i, 0, lines - 1, max(health), min(health)); // Reverse for Y-axis
    let y = 50 + i * yStep;

    line(50, y, width - 50, y); // Horizontal grid lines for health
    textAlign(RIGHT);
    text(int(healthValue), 35, y + 5); // Display health values
  }
}

function drawLegend() {
  let startX = width-150; // X position of legend
  let startY = height-200; // Y position of first item
  let spacing = 30; // Space between legend items

  textSize(14);
  fill(0);
  textAlign(LEFT, CENTER);
  text("Legend:", startX, startY - 20);

  let i = 0;
  for (let region in legendColors) {
    fill(legendColors[region]); // Use semi-transparent color
    rect(startX, startY + i * spacing, 20, 20); // Color box

    fill(0);
    text(region, startX + 30, startY + i * spacing + 10); // Region label
    i++;
  }
}

function sqrtMap(value,inMin,inMax,outMin,outMax){
  sqrtValue = Math.sqrt(value);
  sqrtMin = Math.sqrt(inMin);
  sqrtMax = Math.sqrt(inMax);
  return map(sqrtValue,sqrtMin,sqrtMax,outMin,outMax);
}

function logMap(value,inMin,inMax,outMin,outMax){
  logValue = Math.log(value);
  // to be more error-tolerant, value should be checked for 0, but in this case, it is not necessary
  logMin = Math.log(inMin);
  logMax = Math.log(inMax);
  return map(logValue,logMin,logMax,outMin,outMax);
}

function draw() {
  background(255);
  drawAxes();
  drawGrid(11); // 22 lines total (including axes)
  drawLegend();
  for(let i=0;i<totalCountries;i++){
    x=logMap(income[i],min(income),max(income),55,width-55);
    y=map(health[i],30,90,height-20,20);
    r=sqrtMap(population[i],min(population),max(population),10,100)/1.2;
    if(hovered(r,x,y)){
      // if a circle is hovered, then text creation
      fill(50);
      textSize(12);
      textAlign(CENTER);
      text(country[i],x,y+r/2+20);
      text(income[i],x,height-60);
      text(health[i],70,y);
      // if a circle is hovered, then circle color changes, and bigger circle is drawn
      fillColor = regionColors[region[i]]+'aa';
      stroke(fillColor);
      strokeWeight(2);
      fill(fillColor);
      ellipse(x,y,r,r);
    }
    else{
      fillColor = regionColors[region[i]]+'88';
      fill(fillColor);
      noStroke();
      ellipse(x,y,r,r);
    }
    
  }
}

function drawAxis(){
  // axis names
  fill(0);
  textSize(12);
  textAlign(CENTER);
  text("Income",width/2,height-5);
  text("Health",20,20);
  // axes
  stroke(220);
  strokeWeight(2);
  line(10,height-20,width-20,height-20);
  line(10,30,10,height-20);
}

function keyPressed(){
  if(key=='s'){
    saveCanvas("health-income","png");
  }
}

function hovered(r,x,y){
  if(mouseX>x-r/2 && mouseX<x+r/2 && mouseY>y-r/2 && mouseY<y+r/2){
    return true;
  }
  else{
    return false;
  }
}