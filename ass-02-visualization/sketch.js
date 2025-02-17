let table;
let country;
let region;
let income;
let health;
let population;
let totalCountries;
let width=1400;
let height=700;
let regionColors = {
  "ASIA (EX. NEAR EAST)" :"#56b8cf",
  "EAST ASIA": "#56b8cf",
  "NEAR EAST": "#56b8cf",
  "NORTHERN AMERICA": "#fb9038",
  "LATIN AMER. & CARIB": "#fb9038",
  "WESTERN EUROPE": "#81eaa5",
  "EASTERN EUROPE": "#81eaa5",
  "BALTICS": "#81eaa5",
  "C.W. OF IND. STATES": "#f9d9a6",
  "NORTHERN AFRICA": "#f9f871",
  "SUB-SAHARAN AFRICA": "#f9f871",
  "OCEANIA": "#965692",
};

function preload() {
  table = loadTable('/assets/health-income.csv', 'csv', 'header');
}

function setup() {
  createCanvas(width, height);

  totalCountries = table.getRowCount();
  country = table.getColumn('country');
  region = table.getColumn('region');
  income = table.getColumn('income');
  health = table.getColumn('health');
  population = table.getColumn('population');

  // print(totalCountries);
  // print(regionColors);
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
  for(let i=0;i<totalCountries;i++){
    //x=map(Math.log(income[i]),Math.log(min(income)),Math.log(max(income)),20,width-20);
    x=logMap(income[i],min(income),max(income),20,width-20);
    y=map(health[i],30,90,height-20,20);
    r=sqrtMap(population[i],min(population),max(population),10,100);
    fillColor = regionColors[region[i]];
    fill(fillColor);
    ellipse(x,y,r,r);

    // text creation
    fill(0);
    textSize(r/5);
    textAlign(CENTER);
    text(country[i],x,y);
  }
}

function keyPressed(){
  if(key=='s'){
    saveCanvas("health-income","png");
  }
}