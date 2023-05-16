const numPlanes = 10
const fadeTime  = 1400; // in ms

let medium;
let airplanes;

 /*
  * IDEA: create a planes dictionary to specify different 'models'
  * can use different svg images
  *
  */
let planeColorPalette = ['#FF4577', '#FD8A8A', '#8294C4', '#ACB1D6', '#DBDFEA'];

function setup() {
  createCanvas(800, 600);

  medium = new FluidMedium(0.005, 0.08);
  airplanes = [];
  for (let i = 0; i < numPlanes; i++) {
    airplanes.push(new AirPlane(
      createVector(random(0, width), i * height/ numPlanes),
      random(1.0, 2.0),
      random(3.0, 5.0),
      color(planeColorPalette[i % planeColorPalette.length])
    ));
  }
}

function draw() {
  background('#FFEAD2');
  for (let airplane of airplanes) {
    airplane.run(medium);
  }
}

// for now, make the force field a constant horizontal force

function FluidMedium(inDragCoef, inDensity) {
  this.dragCoef = inDragCoef;
  this.density = inDensity;
}

function AirPlane(inPos, inMass, inCrossSec, inCol) {
  this.pos      = inPos.copy();
  this.vel      = createVector(random(0, 0.5), random(-0.5, 0.5));
  this.accel    = createVector(0, 0);
  this.mass     = inMass;
  this.crossSec = inCrossSec;
  this.col      = color(inCol);
  this.trail    = [];
}

AirPlane.prototype.run = function(medium) {
  this.update(medium);
  this.borders();
  this.render();
}

AirPlane.prototype.update = function(medium) {
  //let windForce = medium.windForce;
  let windForce = createVector(0.01, -0.02 * sin(8 * (this.pos.x / width)));
  let dragForceMag = -0.5 * medium.dragCoef * medium.density * this.crossSec * this.vel.magSq();
  let dragForce = this.vel.copy().normalize();
  dragForce.mult(dragForceMag);

  this.accel.add(p5.Vector.div(windForce, this.mass));
  this.accel.add(p5.Vector.div(dragForce, this.mass));

  this.vel.add(this.accel);
  this.pos.add(this.vel);
  this.accel.mult(0);
  if (frameCount % 6 == 0) {
    this.trail.push(createVector(this.pos.x, this.pos.y, millis()));
  }
}

// Wraparound
AirPlane.prototype.borders = function() {
  if (this.pos.x < -this.crossSec)  this.pos.x = width + this.crossSec;
  if (this.pos.y < -this.crossSec)  this.pos.y = height + this.crossSec;
  if (this.pos.x > width + this.crossSec) this.pos.x = -this.crossSec;
  if (this.pos.y > height + this.crossSec) this.pos.y = -this.crossSec;
}

AirPlane.prototype.render = function() {
  // Draw a triangle rotated in the direction of velocity
  let theta = this.vel.heading() + radians(90);
  noStroke();
  for (let i = this.trail.length-1; i >= 0; i--) {
    let p = this.trail[i];
    let timeAlive = millis() - p.z;
    if (timeAlive > fadeTime) {
      this.trail.shift();
    } else {
      this.col.setAlpha(255 * i / this.trail.length);
      fill(this.col);
      circle(p.x, p.y, 3);
    }
  }
  this.col.setAlpha(255);
  fill(this.col);
  stroke(200);
  push();
  translate(this.pos.x, this.pos.y);
  rotate(theta);
  beginShape();
  vertex(0, -this.crossSec * 2);
  vertex(-this.crossSec, this.crossSec * 2);
  vertex(this.crossSec, this.crossSec * 2);
  endShape(CLOSE);
  pop();
}

