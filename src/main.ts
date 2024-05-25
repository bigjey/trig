type vec2 = {
  x: number;
  y: number;
}

const canvas = document.getElementById('canvas')! as HTMLCanvasElement;
if (!canvas) {
  throw new Error("No #canvas in DOM");
}

const ctx = canvas.getContext('2d')!;
if (!ctx) {
  throw new Error("No 2d canvas context");
}

let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;
let aspect = windowWidth / windowHeight;

const circle = {
  x: windowWidth / 2,
  y: windowHeight / 2,
  r: Math.min(windowHeight, windowWidth) / 2 * 0.5
};

const ray = {
  origin: {
    x: 0,
    y: 0,
  },
  direction: {
    x: windowWidth - 50,
    y: windowHeight - 50
  }
}

function update() { }

function distanceSq(x1: number, y1: number, x2: number, y2: number) {
  return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
}

function distance(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

function normalize(x1: number, y1: number, x2: number, y2: number) {
  const l = distance(x1, y1, x2, y2);

  if (l === 0) {
    throw new Error("Vector length is 0");
  }

  return {
    x: (x2 - x1) / l,
    y: (y2 - y1) / l
  }
}

function drawRay() {
  if (ray.origin.x === ray.direction.x && ray.origin.y === ray.direction.y) {
    return;
  }

  const normal = normalize(ray.origin.x, ray.origin.y, ray.direction.x, ray.direction.y);

  const lineLength = Math.max(windowWidth, windowHeight) * 2;

  ctx.beginPath();
  ctx.moveTo(ray.origin.x - normal.x * lineLength, ray.origin.y - normal.y * lineLength);
  ctx.lineTo(ray.origin.x + normal.x * lineLength, ray.origin.y + normal.y * lineLength);
  ctx.closePath();

  ctx.strokeStyle = '#888';
  ctx.lineWidth = 1;
  ctx.stroke();

  // first point
  ctx.beginPath();
  ctx.arc(ray.origin.x, ray.origin.y, 8, 0, Math.PI * 2);
  ctx.closePath();

  ctx.lineWidth = 2;
  ctx.strokeStyle = '#444';
  ctx.stroke();

  ctx.fillStyle = 'red';
  ctx.fill();


  // second point
  ctx.beginPath();
  ctx.arc(ray.direction.x, ray.direction.y, 8, 0, Math.PI * 2);
  ctx.closePath();

  ctx.lineWidth = 2;
  ctx.strokeStyle = '#444';
  ctx.stroke();

  ctx.fillStyle = 'red';
  ctx.fill();
}

function drawCircle() {
  ctx.beginPath();
  ctx.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI);
  ctx.closePath();

  ctx.strokeStyle = '#888';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawIntersections() {
  const a = ray.origin;
  const b = ray.direction;
  const c = circle;

  const intersections: vec2[] = [];

  // (x - cx) * (x - cx) + (y - cy) * (y - cy) - cr * cr = 0
  // (ax + bx*t - cx) * (ax + bx*t - cx) + (ay + by*t - cy) * (ay + by*t - cy) - cr * cr = 0
  // ax*ax + 2*ax*bx*t - 2*ax*cx + bx*t * bx*t - 2*bx*cx*t + cx*cx + ay*ay + 2*ay*by*t - 2*ay*cy + by*t * by*t - 2*by*cy*t + cy*cy - cr*cr = 0
  // +       +           +         +             +           +       +       +           +         +             +           +       +
  // final quadratic equation
  // (bx*bx + by*by)*(t*t) + (2*ax*bx - 2*bx*cx + 2*ay*by - 2*by*cy)*t + (ax*ax - 2*ax*cx + cx*cx +ay*ay -2*ay*cy + cy*cy - cr*cr) = 0
  const _a = b.x * b.x + b.y * b.y;
  const _b = 2 * a.x * b.x - 2 * b.x * c.x + 2 * a.y * b.y - 2 * b.y * c.y;
  const _c = a.x * a.x - 2 * a.x * c.x + c.x * c.x + a.y * a.y - 2 * a.y * c.y + c.y * c.y - c.r * c.r;

  // quadratic equation discriminant
  const discriminant = _b * _b - 4 * _a * _c;

  // no solutions
  if (discriminant < 0) {
    return;
  }
  // quadratic equation solution
  if (discriminant === 0) {
    // one solution
    const t = (-_b + Math.sqrt(discriminant)) / (2 * _a);

    const p: vec2 = {
      x: a.x + b.x * t,
      y: a.y + b.y * t,
    }

    intersections.push(p);
  } else {
    // two solutions
    {
      const t = (-_b - Math.sqrt(discriminant)) / (2 * _a);
      const p: vec2 = {
        x: a.x + b.x * t,
        y: a.y + b.y * t,
      }
      intersections.push(p);
    }
    {
      const t = (-_b + Math.sqrt(discriminant)) / (2 * _a);
      const p: vec2 = {
        x: a.x + b.x * t,
        y: a.y + b.y * t,
      }
      intersections.push(p);
    }
  }

  for (const point of intersections) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 7, 0, Math.PI * 2);
    ctx.closePath();

    ctx.strokeStyle = '#000';
    ctx.stroke();

    ctx.fillStyle = 'lime';
    ctx.fill();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();

  // ctx.translate(windowWidth/2, windowHeight/2)

  drawCircle();
  drawRay()
  drawIntersections();

  ctx.restore();
}

function frame() {
  update();
  draw();

  requestAnimationFrame(frame);
}

function handleWindowResize() {
  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight;
  aspect = windowWidth / windowHeight;
  canvas.width = windowWidth;
  canvas.height = windowHeight;
  circle.x = windowWidth / 2;
  circle.y = windowHeight / 2;
  circle.r = Math.min(windowHeight, windowWidth) / 2 * 0.5;
}
handleWindowResize();
window.addEventListener('resize', handleWindowResize);

canvas.addEventListener('mousemove', function (e) {
  ray.direction.x = e.pageX;
  ray.direction.y = e.pageY;
})

canvas.addEventListener('touchmove', function (e) {
  ray.direction.x = e.touches[0].pageX;
  ray.direction.y = e.touches[0].pageX;
})

frame();