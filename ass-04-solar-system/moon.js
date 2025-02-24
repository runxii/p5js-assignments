class Moon {
    constructor(planetRadius) {
      this.mr = 3;
      this.pr = planetRadius;
      this.a = random(0, 2 * PI);
      this.moonOrbitRotationX = random(0, 2 * PI);
      this.moonOrbitRotationY = random(0, 2 * PI);
      this.moonOrbitRotationZ = random(0, 2 * PI);
    }
  
    draw() {
      noStroke();
      fill(192);
      push();
      // enabling gives moons different orbits
      // rotateX(this.moonOrbitRotationX);
      // rotateY(this.moonOrbitRotationY);
      // rotateZ(this.moonOrbitRotationZ);
      rotateY(this.a);
      this.a += speed * 10;
      translate(this.pr * 1.5, 0, 0);
      sphere(this.mr);
      pop();
    }
  }