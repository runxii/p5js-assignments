// Global configuration
// let bg = "#191C1A";
let canvaHeight = 650;
let growSpeed = 1;
let strokeWidth = 5;
let textureOffset = 25;

// Mode-specific variables
let startThickness;
let startLen;

// Collections of branches
let branches = [];
let flowerBranches = [];
let forestElements = [];

// Color palettes for different themes - using hex strings for consistency
let forestPalette = ["#008773", "#50a934", "#009a5b", "#ffd588"];
let riverPalette = ["#3498db", "#2980b9", "#85c1e9", "#d6eaf8"];
let leafPalette = ["#27ae60", "#2ecc71", "#58d68d", "#abebc6"];
let cellPalette = ["#ff6b81", "#ff4757", "#ff9ff3", "#f368e0"];

// Transition and mode control
let currentModeIndex = 0;
let transitioning = false;
let transitionStartTime;
let transitionDuration = 3000;
let transitionStartValues;
let transitionBranches = [];

// Transitioning background sound effects
let soundTree, soundRiver, soundLeaf, soundBio;
let currentSoundIndex = 0;
// Set background sound effects
let sounds =[];

// Background images and gradients for each mode
let backgroundImages = [];
let backgroundGradients = [];

// Mode definitions
let modes;



function preload() {
  // background images
  backgroundImages = [
    loadImage("img/tree.jpg"),
    loadImage("img/forest.jpg"),
    loadImage("img/leaf.jpg"),
    loadImage("img/cell.jpg")
  ];
  // background sound effects
  soundFormats('mp3', 'ogg'); // ensure compatibility
  soundTree = loadSound('audio/park.mp3');
  soundRiver = loadSound('audio/river.mp3');
  soundLeaf = loadSound('audio/leaf.mp3');
  soundBio = loadSound('audio/bio.mp3');
}


function setup() {
  createCanvas(windowWidth - 20, canvaHeight);

  userStartAudio(); // allow autoplay after gesture
  sounds = [soundTree, soundRiver, soundLeaf, soundBio];

  // Start playing the first ambient sound (tree mode)
  playBackgroundSound(currentSoundIndex);
  
  // Initialize mode definitions with theme-specific parameters
  modes = [
    { 
      name: "tree", 
      thickness: 100, 
      len: 220, 
      branchColor: color(25, 18, 7),
      bgStart: color(25, 28, 26),
      bgEnd: color(35, 38, 36),
      maxDepth: 4,
      branchingAngle: PI/2.5,
      branchingCount: [2, 5],
      bgSound: 'audio/park.mp3'
    },
    { 
      name: "river", 
      thickness: 20, 
      len: 180, 
      branchColor: color(220, 236, 240,140),
      bgStart: color(25, 35, 45),
      bgEnd: color(15, 25, 35),
      maxDepth: 4,
      branchingAngle: PI/3,
      branchingCount: [2, 3],
      bgSound: 'audio/river.mp3'
    },
    { 
      name: "leaf", 
      thickness: 15, 
      len: 220, 
      branchColor: color(224, 235, 191),
      bgStart: color(30, 40, 20),
      bgEnd: color(40, 50, 30),
      maxDepth: 7,
      branchingAngle: PI/5,
      branchingCount: [2,3],
      bgSound: 'audio/leaf.mp3'
    },
    { 
      name: "cell", 
      thickness: 10, 
      len: 350, 
      branchColor: color(219, 213, 245),
      bgStart: color(40, 20, 40),
      bgEnd: color(50, 30, 50),
      maxDepth: 4,
      branchingAngle: 1.5*PI,
      branchingCount: [4, 5],
      bgSound: 'audio/bio.mp3'
    },
  ];
  
  // Initialize with the first mode
  initializeMode(modes[currentModeIndex]);
  
  // Create background gradients for each mode
  for (let mode of modes) {
    backgroundGradients.push(createBackgroundGradient(mode.bgStart, mode.bgEnd));
  }
}

/**
 * Creates a background gradient for transitioning between modes
 * @param {p5.Color} startColor - The gradient start color
 * @param {p5.Color} endColor - The gradient end color
 * @returns {p5.Graphics} - Graphics object with the gradient
 */
function createBackgroundGradient(startColor, endColor) {
  let gfx = createGraphics(width, height);
  gfx.background(startColor);
  
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(startColor, endColor, inter);
    gfx.stroke(c);
    gfx.line(0, y, width, y);
  }
  
  return gfx;
}

/**
 * Handle mouse clicks to transition between modes
 */
function mousePressed() {

  // Switch the sound effect based on the current mode
  // Stop current sound
  if (sounds[currentSoundIndex].isPlaying()) {
    sounds[currentSoundIndex].stop();
  }

  // Go to next
  currentSoundIndex = (currentSoundIndex + 1) % sounds.length;

  // Play new one
  playBackgroundSound(currentSoundIndex);

  transitionToNextMode();
}

/**
 * Resizes canvas when window is resized
 */
function windowResized() {
  resizeCanvas(windowWidth - 20, canvaHeight);
}

function draw() {
  let modeName = modes[currentModeIndex].name;
  let progress = transitioning ? constrain((millis() - transitionStartTime) / transitionDuration, 0, 1) : 1;

  // During transition, blend between the previous and current background images.
  if (transitioning) {
    let prevIdx = (currentModeIndex - 1 + modes.length) % modes.length;
    blendBackgrounds(backgroundImages[prevIdx], backgroundImages[currentModeIndex], progress);
  } else {
    image(backgroundImages[currentModeIndex], 0, 0, width, height);
  }

  // Handle branch drawing during transition
  if (transitioning) {
    // Draw previous mode branches fading out
    for (let b of transitionBranches) {
      b.update();
      b.show(1 - progress, transitionStartValues.branchColor);
    }
    
    // Draw current mode branches fading in
    for (let b of branches) {
      b.update();
      b.show(progress, modes[currentModeIndex].branchColor);
    }
    
    if (progress === 1) transitioning = false;
  } else {
    // Regular branch drawing when not transitioning
    for (let b of branches) {
      b.update();
      b.show(1, modes[currentModeIndex].branchColor);
    }
  }

  // Draw mode-specific decorative elements
  if (modeName === "tree") {
    for (let b of flowerBranches) {
      drawFlower(b);
    }
  } else if (modeName === "river") {
    drawForestElements();
  } else if (modeName === "leaf") {
    drawLeafTexture();
  } else if (modeName === "cell") {
    drawCellularElements();
  }
}

/**
 * Blends two background gradients based on progress
 * @param {sounds.index} index - play the sound effects for each mode in order
 */
function playBackgroundSound(index) {
  sounds[index].setLoop(true);
  sounds[index].setVolume(0.4);
  sounds[index].play();
}


/**
 * Blends two background gradients based on progress
 * @param {p5.Graphics} bg1 - First background
 * @param {p5.Graphics} bg2 - Second background
 * @param {number} progress - Blend progress (0-1)
 */
function blendBackgrounds(bg1, bg2, progress) {
  push();
  blendMode(BLEND);
  tint(255, 255, 255, 255 * (1 - progress));
  image(bg1, 0, 0, width, height);
  tint(255, 255, 255, 255 * progress);
  image(bg2, 0, 0, width, height);
  pop();
}


/**
 * Draws flowers at the end of tree branches
 * @param {Branch} branch - The branch to add flowers to
 */
function drawFlower(branch) {
  if (branch.depth > 1 && branch.children.length === 0) {
    let end = p5.Vector.add(branch.pos, p5.Vector.mult(branch.dir, branch.currentLen));
    
    // Only draw flowers on branches that have grown fully
    if (branch.currentLen >= branch.targetLen * 0.9) {
      noStroke();
      
      // Draw petals
      for (let i = 0; i < 5; i++) {
        let angle = TWO_PI * i / 5;
        let x = end.x + cos(angle) * 8;
        let y = end.y + sin(angle) * 8;
        // set the pedal's color
        fill(241, 126, 178, 180);
        ellipse(x, y, 12, 12);
      }
      
      // Draw center of the flower
      fill(240, 239, 201, 180 );
      ellipse(end.x, end.y, 7, 7);
    }
  }
}

/**
 * Draws forest elements along river branches
 * Fixed to grow alongside river branches rather than just at ends
 */
function drawForestElements() {
  // Only draw forest elements if we're in river mode
  if (modes[currentModeIndex].name !== "river") return;
  
  // Add new forest elements along growing branches
  for (let branch of branches) {
    // Removed depth > 0 condition; now includes every branch level.
    if (branch.depth >= 0 && random() < 0.01) {
      // Calculate position along the branch
      let t = random(0.3, 0.9); // Position along the branch (0-1)
      let position = p5.Vector.add(
        branch.pos,
        p5.Vector.mult(branch.dir, branch.currentLen * t)
      );
      
      // Add offset perpendicular to branch direction
      let perpDir = createVector(-branch.dir.y, branch.dir.x);
      let offset = random(-30, 30);
      position.add(p5.Vector.mult(perpDir, offset));
      
      // Calculate size based on branch thickness and growth
      let size = map(branch.currentLen / branch.targetLen, 0, 1, 5, 15);
      size *= random(0.7, 1.3);
      
      // Add to forest elements if it's in the canvas
      if (position.x > 0 && position.x < width && position.y > 0 && position.y < height) {
        // Use a specific index from the forestPalette array to avoid color issues
        let colorIndex = floor(random(forestPalette.length));
        forestElements.push({
          pos: position,
          size: size,
          color: forestPalette[colorIndex], // Use indexed color from the palette
          growthRate: random(0.02, 0.05),
          maxSize: random(10, 30),
          currentSize: 0
        });
      }
    }
  }
  
  // Draw and update existing forest elements
  for (let i = forestElements.length - 1; i >= 0; i--) {
    let element = forestElements[i];
    
    // Grow element
    if (element.currentSize < element.maxSize) {
      element.currentSize += element.growthRate * element.maxSize;
    }
    
    // Draw element - make sure we're using a valid color
    fill(element.color); // This should be a valid hex string
    noStroke();
    circle(element.pos.x, element.pos.y, element.currentSize);
    
    // Add some variation with smaller circles using RGB values for a semi-transparent fill
    let c = color(element.color);
    fill(red(c), green(c), blue(c), 150);
    circle(element.pos.x + random(-5, 5), element.pos.y + random(-5, 5), element.currentSize * 0.6);
  }
  
  // Limit the number of forest elements for performance
  if (forestElements.length > 200) {
    forestElements.splice(0, 50);
  }
}

/**
 * Draws leaf vein textures for leaf mode
 */
function drawLeafTexture() {
  if (modes[currentModeIndex].name !== "leaf") return;
  
  // Draw subtle vein texture on branches
  for (let branch of branches) {
    if (branch.depth > 0 && branch.currentLen > 5) {
      let steps = int(branch.currentLen / 10);
      for (let i = 0; i < steps; i++) {
        let t = i / steps;
        let length = branch.currentLen * t;
        let p = p5.Vector.add(branch.pos, p5.Vector.mult(branch.dir, length));
        
        // Draw perpendicular lines like leaf veins
        if (random() < 0.3) {
          let perpDir = createVector(-branch.dir.y, branch.dir.x);
          let veinLength = map(branch.startThickness, 0, 30, 5, 15) ;
          
          stroke(120, 255, 180, 50);
          strokeWeight(1);
          
          // Draw on both sides of the branch
          line(
            p.x + perpDir.x * veinLength, 
            p.y + perpDir.y * veinLength,
            p.x - perpDir.x * veinLength,
            p.y - perpDir.y * veinLength
          );
        }
      }
    }
  }
}

/**
 * Draws cellular elements for cell mode
 */
function drawCellularElements() {
  if (modes[currentModeIndex].name !== "cell") return;
  
  // Add cell membrane effect
  noFill();
  stroke(226, 219, 249, 50);
  strokeWeight(1.5);
  
  // Draw cell borders between branches
  for (let i = 0; i < branches.length; i++) {
    let b1 = branches[i];
    if (b1.depth > 1) {
      let end1 = p5.Vector.add(b1.pos, p5.Vector.mult(b1.dir, b1.currentLen));
      
      // Connect to other nearby branch endpoints
      for (let j = i + 1; j < branches.length; j++) {
        let b2 = branches[j];
        if (b2.depth > 1) {
          let end2 = p5.Vector.add(b2.pos, p5.Vector.mult(b2.dir, b2.currentLen));
          let distance = p5.Vector.dist(end1, end2);
          
          // Only draw connections between nearby branches
          if (distance < 100) {
            let opacity = map(distance, 0, 100, 100, 20);
            stroke(243, 129, 162, opacity);
            bezier(
              end1.x, end1.y,
              end1.x + b1.dir.x * 20, end1.y + b1.dir.y * 20,
              end2.x + b2.dir.x * 20, end2.y + b2.dir.y * 20,
              end2.x, end2.y
            );
          }
        }
      }
    }
  }
}

/**
 * Initializes a new mode with specific parameters
 * @param {Object} mode - The mode configuration
 */
function initializeMode(mode) {
  startThickness = mode.thickness;
  startLen = mode.len;
  
  // Clear existing branches
  branches = [];
  flowerBranches = [];
  
  // Create a new root branch
  let root = new Branch(
    createVector(width / 2, height),
    createVector(0, -1),
    startLen,
    0,
    startThickness,
    mode
  );
  
  branches.push(root);
  
  // Clear decorative elements when switching modes
  if (mode.name === "river") {
    forestElements = [];
  }
}

/**
 * Transitions to the next mode in the cycle
 */
function transitionToNextMode() {
  let currentMode = modes[currentModeIndex];
  transitionStartValues = {
    branchColor: currentMode.branchColor
  };
  transitionBranches = [...branches];

  // Move to next mode
  currentModeIndex = (currentModeIndex + 1) % modes.length;

  // Initialize new mode
  let mode = modes[currentModeIndex];
  startThickness = mode.thickness;
  startLen = mode.len;

  // Reset branches for new mode
  branches = [];
  flowerBranches = [];
  
  // Create a new root branch
  let root = new Branch(
    createVector(width / 2, height),
    createVector(0, -1),
    startLen,
    0,
    startThickness,
    mode
  );
  branches.push(root);

  // Start transition animation
  transitioning = true;
  transitionStartTime = millis();
}

/**
 * Branch class represents a single branch in the generative system
 */
class Branch {
  /**
   * Create a new branch
   * @param {p5.Vector} pos - Starting position
   * @param {p5.Vector} dir - Direction vector
   * @param {number} len - Target length
   * @param {number} depth - Branch depth level
   * @param {number} parentEndThickness - Thickness inherited from parent
   * @param {Object} mode - Current mode configuration
   */
  constructor(pos, dir, len, depth = 0, parentEndThickness, mode = null) {
    this.pos = pos.copy();
    this.dir = dir.copy().mult(random(0.9, 1.1));
    this.targetLen = len;
    this.currentLen = 0;
    this.finished = false;
    this.children = [];
    this.depth = depth;
    this.startThickness = parentEndThickness;
    
    // Apply mode-specific falloff factor
    if (mode) {
      // Different thickness falloff for different modes
      if (mode.name === "tree") {
        this.falloffFactor = 0.6;
      } else if (mode.name === "river") {
        this.falloffFactor = 0.7;
      } else if (mode.name === "leaf") {
        this.falloffFactor = 0.8;
      } else if (mode.name === "cell") {
        this.falloffFactor = 0.5;
      } else {
        this.falloffFactor = 0.4;
      }
      this.mode = mode;
    } else {
      this.falloffFactor = 0.4;
      this.mode = modes[currentModeIndex];
    }
    
    this.endThickness = this.startThickness * this.falloffFactor;
    this.noiseOffset = random(1000);
    
    // Add some curvature based on mode
    if (this.mode) {
      if (this.mode.name === "leaf") {
        // Leaf veins curve more at the ends
        this.curvature = random(0.01, 0.05);
      } else if (this.mode.name === "river") {
        // Rivers meander more
        this.curvature = random(0.03, 0.08);
      } else {
        this.curvature = random(0.01, 0.03);
      }
    } else {
      this.curvature = random(0.01, 0.03);
    }
  }

  /**
   * Update branch growth and spawn children when ready
   */
  update() {
    // Grow the branch
    if (this.currentLen < this.targetLen) {
      this.currentLen += growSpeed;
      
      // Add slight curvature as branches grow
      if (this.depth > 0) {
        let noiseVal = noise(
          this.pos.x * 0.01, 
          this.pos.y * 0.01, 
          frameCount * 0.001 + this.noiseOffset
        );
        let angleChange = map(noiseVal, 0, 1, -0.02, 0.02) * this.curvature;
        this.dir.rotate(angleChange);
        this.dir.normalize();
      }
    } else if (!this.finished && this.depth < this.mode.maxDepth) {
      // Spawn children when full length is reached
      this.spawnChildren();
      this.finished = true;
    }
    
    // Update children
    for (let child of this.children) {
      child.update();
    }
  }

  /**
   * Draw the branch and manage decorative elements
   * @param {number} alphaScale - Opacity scaling for transitions
   * @param {p5.color} col - Branch color
   */
  show(alphaScale = 1, col = color(255)) {
    this.drawTexturedBranch(alphaScale, col);
    
    // Show children
    for (let child of this.children) {
      child.show(alphaScale, col);
    }
    
    // Add branch to flower branches if it's a terminal branch
    if (this.depth > 1 && this.children.length === 0 && !flowerBranches.includes(this)) {
      flowerBranches.push(this);
    }
  }

  /**
   * Draw branch with texture appropriate to current mode
   * @param {number} alphaScale - Opacity scaling for transitions
   * @param {p5.color} col - Branch color
   */
  drawTexturedBranch(alphaScale, col) {
    let steps = int(this.currentLen / 5);
    let base = this.pos.copy();
    
    for (let i = 0; i < steps; i++) {
      let t = i / steps;
      let length = this.currentLen * t;
      let p = p5.Vector.add(base, p5.Vector.mult(this.dir, length));
      let angle = atan2(this.dir.y, this.dir.x) + PI / 2;

      let offset = 0;
      
      // Apply different texturing based on mode
      if (this.mode.name === "leaf") {
        // Smoother texture for leaf veins
        offset = 0;
      } else if (this.mode.name === "river") {
        // More meandering texture for rivers
        let n = noise(p.x * 0.02, p.y * 0.02, this.noiseOffset);
        offset = map(n, 0, 1, -textureOffset, textureOffset) * 1.5;
      } else if (this.mode.name === "cell") {
        // Cellular texture has sharper angles
        let n = noise(p.x * 0.03, p.y * 0.03, this.noiseOffset);
        offset = map(n, 0, 1, -textureOffset/2, textureOffset/2) * (n > 0.5 ? 1 : -1);
      } else {
        // Tree texture
        let n = noise(p.x * 0.01, p.y * 0.01, this.noiseOffset);
        offset = map(n, 0, 1, -textureOffset, textureOffset);
      }

      let x1 = p.x + cos(angle) * offset;
      let y1 = p.y + sin(angle) * offset;

      // Determine thickness based on mode
      let thickness;
      if (this.mode.name === "leaf") {
        // Leaf veins maintain more thickness
        thickness = this.startThickness * (0.95 - t * 0.3);
      } else if (this.mode.name === "river") {
        // Rivers narrow more gradually
        thickness = lerp(this.startThickness, this.endThickness, Math.pow(t, 0.7));
      } else if (this.mode.name === "cell") {
        // Cells have more uniform thickness
        thickness = lerp(this.startThickness, this.endThickness, t*0.5);
      } else {
        // Normal tapering for trees
        thickness = lerp(this.startThickness, this.endThickness, t);
      }
      
      // Draw the branch segment
      noStroke();
      fill(red(col), green(col), blue(col), 255 * alphaScale);
      circle(x1, y1, thickness);
    }
  }

  /**
   * Create child branches when this branch reaches full length
   */
  spawnChildren() {
    let end = p5.Vector.add(this.pos, p5.Vector.mult(this.dir, this.targetLen));
    
    // Number of branches varies by mode
    let minBranches = this.mode.branchingCount[0];
    let maxBranches = this.mode.branchingCount[1];
    let num = int(random(minBranches, maxBranches));
    
    // Branch angle varies by mode
    let maxAngle = this.mode.branchingAngle;
    
    for (let i = 0; i < num; i++) {
      // Direction depends on mode
      let angle;
      if (this.mode.name === "cell") {
        // Cell branches can go in any direction
        angle = random(-PI, PI);
      } else if (this.mode.name === "leaf") {
        // Leaf veins branch more symmetrically
        angle = map(i, 0, num-1, -maxAngle, maxAngle);
        angle += random(-PI/10, PI/10); // Add slight randomness
      } else {
        // Trees and rivers have similar branching patterns
        angle = random(-maxAngle, maxAngle);
      }
      
      let newDir = this.dir.copy().rotate(angle).normalize();
      
      // For everything except cells, branches tend to grow upward
      if (this.mode.name !== "cell") {
        newDir.y = constrain(newDir.y, -1, 0);
      }
      
      // Length factor varies by mode
      let lengthFactor;
      if (this.mode.name === "leaf") {
        lengthFactor = random(0.5, 0.8); // Shorter branches for leaves
      } else if (this.mode.name === "river") {
        lengthFactor = random(0.7, 0.9); // Longer branches for rivers
      } else {
        lengthFactor = random(0.6, 0.85);
      }
      
      let newLen = this.targetLen * lengthFactor;
      let child = new Branch(end, newDir, newLen, this.depth + 1, this.endThickness, this.mode);
      this.children.push(child);
      branches.push(child);
    }
  }
}