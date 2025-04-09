let bg= "#191C1A";
//let bg = "#DADADA";
let canvaHeight=650;
let growSpeed = 1; // growth speed (pixels per frame)
let branchColor = "#DADADA"; // dark brown
let strokeWidth = 5;
let startThickness = 120;
let startLen = 200;
let textureOffset = 25;

let branches = [];
let flowerPos = [];

function setup() {
  let boardCanvas = createCanvas(windowWidth-20, canvaHeight);
  boardCanvas.parent("canva");
  background(bg);

  console.log("canva setup");

  let root = new Branch(createVector(width / 2, height), createVector(0, -1), startLen, 0, startThickness);
  branches.push(root);
  console.log(branches);

}

function windowResized(){
  resizeCanvas(windowWidth-20, canvaHeight);
  // Resize the canvas when the window is resized
  background(bg);
}

function draw() {
  background(bg);
  for (let b of branches) {
    b.update();
    b.show();
  }

  // Display flowers at saved positions
  for (let pos of flowerPos) {
    drawFlower(pos.x, pos.y);
  }

}


function drawFlower(x, y) {
  fill('pink');
  ellipse(x, y, 10, 10); // Simple flower representation
}


class Branch {
  constructor(pos, dir, len, depth = 0, parentEndThickness) {
    this.pos = pos.copy();
    this.dir = dir.copy().mult(random(0.9, 1.1));
    this.targetLen = len;
    this.currentLen = 0;
    this.finished = false;
    this.children = [];
    this.depth = depth;

    
    // controls the thickness of branches, tip's thinner
    this.startThickness = parentEndThickness;
    this.falloffFactor = 0.4;
    this.endThickness = this.startThickness * this.falloffFactor;

    this.noiseOffset = random(1000); // for unique noise per branch
  }

  // 4 layers in total, when the branch reaches target length. grow finished
  update() {
    if (this.currentLen < this.targetLen) {
      this.currentLen += growSpeed;
      flowerPos.push(this.pos.copy());
    } else if (!this.finished && this.depth < 4) {
      this.spawnChildren();
      this.finished = true;
      flowerPos.push(this.pos);
    }
    

    for (let child of this.children) {
      child.update();
    }
  }

  show() {
    this.drawTexturedBranch();

    for (let child of this.children) {
      child.show();
    }
  }

  drawTexturedBranch() {
    let steps = int(this.currentLen / 5);
    let base = this.pos.copy();

    for (let i = 0; i < steps; i++) {
      let t = i / steps;
      let length = this.currentLen * t;

      // create trees with curves and little offset rather than the straight stick
      let p = p5.Vector.add(base, p5.Vector.mult(this.dir, length));
      let angle = atan2(this.dir.y, this.dir.x) + PI / 2;
      let n = noise(p.x * 0.01, p.y * 0.01, this.noiseOffset);
      let offset = map(n, 0, 1, -textureOffset, textureOffset);

      let x1 = p.x + cos(angle) * offset;
      let y1 = p.y + sin(angle) * offset;

      //let thickness = map(1 - t, 0, 1, 2, 5) * (1 - this.depth * 0.1);
      // let last level's end thickness be the next level's start thickness, to keep the consistency
      let thickness = lerp(this.startThickness, this.endThickness, t);
      noStroke();
      fill(branchColor);
      circle(x1, y1, thickness);
      // Check if this branch is a leaf node
    }
  }

  spawnChildren() {
    let end = p5.Vector.add(this.pos, p5.Vector.mult(this.dir, this.targetLen));
    let num = int(random(3, 4));
    for (let i = 0; i < num; i++) {
      let angle = random(-PI / 2.5, PI / 2.5);
      let newDir = this.dir.copy().rotate(angle).normalize();
      newDir.y = constrain(newDir.y, -1, -0.1);
      let newLen = this.targetLen * random(0.6, 0.9);

      // pass the thickness to next level
      let child = new Branch(end, newDir, newLen, this.depth + 1, this.endThickness);
      this.children.push(child);
      branches.push(child);
    }
  }
}
