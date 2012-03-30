function drawBubble(ctx, x, y, w, h, radius) {
  var r = x + w;
  var b = y + h;
  ctx.beginPath();
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + radius / 2, y - 10);
  ctx.lineTo(x + radius * 2, y);
  ctx.lineTo(r - radius, y);
  ctx.quadraticCurveTo(r, y, r, y + radius);
  ctx.lineTo(r, y + h - radius);
  ctx.quadraticCurveTo(r, b, r - radius, b);
  ctx.lineTo(x + radius, b);
  ctx.quadraticCurveTo(x, b, x, b - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.stroke();
}

document.addEventListener('DOMContentLoaded', function() {
  var v = document.getElementById('v');
  var canvas = document.getElementById('c');
  var context = canvas.getContext('2d');

  var cw = Math.floor(canvas.clientWidth / 100);
  var ch = Math.floor(canvas.clientHeight / 100);
  canvas.width = cw;
  canvas.height = ch;

 // console.log('width: ' + cw + ', ' + ch);


  v.addEventListener('play', function() {
    draw(this, context, cw, ch);
    console.log(cw);
  }, false);

}, false);

function draw(v, c, w, h) {
  if (v.paused || v.ended) return false;
  c.drawImage(v, 0, 0, w, h);
  setTimeout(draw, 20, v, c, w, h);
}


