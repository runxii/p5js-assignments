class Planet {
    constructor() {
      this.or = random(sunRadius, width / 2);
      this.pr = random(minPlanetRadius, maxPlanetRadius);
      this.a = random(0, 2 * PI);
      this.c = color(random(255), random(255), random(255));
      this.s = random(speed * 0.5, speed * 2.0);
      this.outOfPlaneAngle = (random(-PI / 32, PI / 32));
      let x = random(0, 3);
      this.moons = [];
      this.numOfMoons = 0;
      if (x < 1) {
        this.numOfMoons = floor(random(1, 5));
        this.createMoons();
      } else
      if (x < 2) {
        this.ring = true;
        this.ringAngleX= random(0, 2 * PI);
        this.ringAngleY= random(0, 2 * PI);
        this.ringAngleZ= random(0, 2 * PI);
      }
  
    }
  
    drawPlanet() {
      push();
      fill(this.c);
      noStroke();
      this.a += speed;
      rotateY(this.outOfPlaneAngle);
      rotateZ(this.a);
      translate(this.or, 0, 0);
      sphere(this.pr);
      this.drawMoons();
      this.drawRing();
      pop();
    }
  
    drawOrbit() {
      noFill();
      stroke(75);
      strokeWeight(1);
      push();
      rotateY(this.outOfPlaneAngle);
      circle(0, 0, this.or * 2);
      pop();
    }
  
    createMoons() {
      for (let i = 0; i < this.numOfMoons; i++) {
        this.moons.push(new Moon(this.pr));
      }
    }
  
    drawMoons() {
      for (let moon of this.moons) {
        moon.draw();
      }
    }
  
    drawRing() {
      if(this.ring){
        push();
        rotateX(this.ringAngleX);
        rotateY(this.ringAngleY);
        rotateZ(this.ringAngleZ);
        noFill();
        stroke(200);
        strokeWeight(3);
        circle(0, 0, this.pr * 2.75);
        pop();
      }
    }
  }