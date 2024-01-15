const canvas = document.getElementById("display");
const data = document.getElementById("data");
const ctx = canvas.getContext("2d");

const gridWidth = 200;
const gridHeight = 200;

// types
const EMPTY = 0;
const SAND = 1;
const WATER = 2;

const colors = [
  "#000000",
  "#f6d7b0",
  "#0000ff"
];

let particles = [];
let grid = new Array(gridWidth * gridHeight).fill(EMPTY);
let mouse = { x: 0, y: 0 };
let click = false;
let currP = SAND;
let lastTime = 0;

function init() {
  canvas.width = gridWidth;
  canvas.height = gridHeight;

  document.addEventListener("mousemove", (e) => {
    let screenX = e.clientX;
    let screenY = e.clientY;
    let rect = canvas.getBoundingClientRect();
    let scaleX = rect.width / gridWidth;
    let scaleY = rect.height / gridHeight;
    let relativeX = (screenX - rect.left) / scaleX;
    let relativeY = (screenY - rect.top) / scaleY;

    mouse = { x: relativeX, y: relativeY };
  });

  document.addEventListener("keydown", (e) => {
    if (e.key == "f") {
      if (currP == WATER) currP = SAND;
      else currP = WATER;
    }
  })

  document.addEventListener("mousedown", (e) => {
    click = true;
  });

  document.addEventListener("mouseup", (e) => {
    click = false;
  });
  
  loop();
}

function loop() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, gridWidth, gridHeight);

  let time = performance.now();
  let dt = time - lastTime;
  lastTime = time;
  data.innerHTML = `FPS: ${(1000 / dt).toFixed(2)}`;;

  if (click) {
    placeCircle(Math.round(mouse.x), Math.round(mouse.y), 20, currP, 0.02);
  }

  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    grid[ixv(p)] = EMPTY;

    if (p.type == SAND || p.type == WATER) {
      let updated = (p.type == SAND) ? updateSand(p) : updateWater(p);
      p.x = updated.x;
      p.y = updated.y;
      grid[ixv(p)] = p.type;
    }
  }
  
  for (let i = 0; i < particles.length; i++) {
    drawParticle(i);
  }

  requestAnimationFrame(loop);
}

/* Draw Fns */
function drawParticle(index) {
  let particle = particles[index];
  let color = colors[particle.type];
  ctx.fillStyle = color;
  ctx.fillRect(particle.x, particle.y, 1, 1);
}

/* Update Fns */
function updateSand(p) {
  // todo: make y offset scale by global grav
  let dwn = { x: p.x, y: p.y + 1 };
  // todo: make x offset perp to global grav
  let lft = { x: dwn.x - 1, y: dwn.y };
  let rgt = { x: dwn.x + 1, y: dwn.y };
  if (dwn.y >= gridHeight) return p;
  if (grid[ixv(dwn)] == EMPTY) return dwn;
  if (grid[ixv(lft)] == EMPTY && lft.x >= 0) return lft;
  if (grid[ixv(rgt)] == EMPTY && rgt.x < gridWidth) return rgt;
  else return p;
}

function updateWater(p) {
  // todo: make y offset scale by global grav
  let dwn = { x: p.x, y: p.y + 1 };
  // todo: make x offset perp to global grav
  let lft = { x: dwn.x - 1, y: p.y };
  let rgt = { x: dwn.x + 1, y: p.y };
  let dwnlft = { x: lft.x, y: dwn.y };
  let dwnrgt = { x: rgt.x, y: dwn.y };
  let canDown = dwn.y < gridHeight;
  let canLeft = lft.x >= 0;
  let canRight = rgt.x < gridWidth;
  if (grid[ixv(dwn)] == EMPTY && canDown) return dwn;
  if (grid[ixv(dwnlft)] == EMPTY && canLeft && canDown) return dwnlft;
  if (grid[ixv(dwnrgt)] == EMPTY && canRight && canDown) return dwnrgt;
  if (grid[ixv(lft)] == EMPTY && canLeft) return lft;
  if (grid[ixv(rgt)] == EMPTY && canRight) return rgt;
  else return p;
}

/* Helper Fns */
function placeCircle(x, y, r, type, chance = 1) {
  for (let ox = -r; ox <= r; ox += 1) {
    for (let oy = -r; oy <= r; oy += 1) {
      if (Math.sqrt(ox * ox + oy * oy) > r) continue;
      if (Math.random() > chance) continue;
      let nx = x + ox, ny = y + oy;
      if (grid[ix(nx, ny)] != EMPTY) continue;
      grid[ix(nx, ny)] = type;
      particles.push({ type: type, x: nx, y: ny });
    }
  }
}

function ix(x, y) {
  return x * gridHeight + y;
}

function ixv(p) {
  return p.x * gridHeight + p.y;
}

function revIX(i) {
  return {
    x: i % gridWidth,
    y: Math.floor(i / gridWidth)
  }
}

init();