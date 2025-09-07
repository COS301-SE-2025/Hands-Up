export function drawDisplay(canvas, text) {
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'green';
  ctx.font = 'bold 30px Arial';
  ctx.fillText(text, 100, 40);

  const boxWidth = canvas.width * 0.2;
  const boxHeight = canvas.height * 0.6;
  const boxY = canvas.height * 0.2;

  const startBox = { x: canvas.width * 0.78, y: boxY, width: boxWidth, height: boxHeight }; 
  const endBox   = { x: -0.10, y: boxY, width: boxWidth, height: boxHeight }; 

  ctx.strokeStyle = 'yellow';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]); 

  ctx.strokeRect(startBox.x, startBox.y, startBox.width, startBox.height);
  ctx.strokeRect(endBox.x, endBox.y, endBox.width, endBox.height);

  ctx.setLineDash([]);

  // ctx.fillStyle = 'yellow';
  // ctx.font = 'bold 20px Arial';
  // ctx.fillText("Start", startBox.x + 60, startBox.y - 10);
  // ctx.fillText("End", endBox.x + 60, endBox.y - 10);
}
