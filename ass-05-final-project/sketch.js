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

let flowerImgs = [
  "img/bud-left.png",
  "img/bud-right.png",
  "img/full-bloom.png",
  "img/half-bloom-left.png",
  "img/half-bloom-right.png",
];

let flowerPlaced = false;

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


// 判断所有分支都长完了
// function allBranchesGrown() {
//   return branches.every(b => b.finished);
// }

function placeFlowers() {
  for (let b of branches) {
    if (b.children.length === 0) {
      let end = p5.Vector.add(b.pos, p5.Vector.mult(b.dir, b.targetLen));
      let screenPos = end.copy(); // 不使用 screenPosition()

      let imgSrc = random(flowerImgs);
      let flowerSize = random(10, 30);

      let img = createImg(imgSrc, "");
      img.size(flowerSize, flowerSize);
      img.position(screenPos.x - flowerSize / 2, screenPos.y - flowerSize / 2);
      img.style('position', 'absolute');
      img.style('pointer-events', 'none');
      img.style('z-index', '100');
    }
  }
}

function draw() {
  background(bg);
  for (let b of branches) {
    b.update();
    b.show();
  }

  if (!flowerPlaced) {
    console.log("all branches grown");
    placeFlowers();
    flowerPlaced = true;
  }

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

    
    // 粗细控制
    this.startThickness = parentEndThickness;
    this.falloffFactor = 0.4;
    this.endThickness = this.startThickness * this.falloffFactor;

    this.noiseOffset = random(1000); // for unique noise per branch
  }

  update() {
    if (this.currentLen < this.targetLen) {
      this.currentLen += growSpeed;
    } else if (!this.finished && this.depth < 4) {
      this.spawnChildren();
      this.finished = true;
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
      let p = p5.Vector.add(base, p5.Vector.mult(this.dir, length));
      let angle = atan2(this.dir.y, this.dir.x) + PI / 2;
      let n = noise(p.x * 0.01, p.y * 0.01, this.noiseOffset);
      let offset = map(n, 0, 1, -textureOffset, textureOffset);

      let x1 = p.x + cos(angle) * offset;
      let y1 = p.y + sin(angle) * offset;

      //let thickness = map(1 - t, 0, 1, 2, 5) * (1 - this.depth * 0.1);
      // 从 startThickness 过渡到 endThickness
      let thickness = lerp(this.startThickness, this.endThickness, t);
      noStroke();
      fill(branchColor);
      circle(x1, y1, thickness);
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
      // 把当前分支的 endThickness 作为下一层的 startThickness 传下去
      let child = new Branch(end, newDir, newLen, this.depth + 1, this.endThickness);
      this.children.push(child);
      branches.push(child);
    }
  }
}