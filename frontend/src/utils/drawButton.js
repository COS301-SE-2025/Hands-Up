export function drawButton(canvas, text) {
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const button = { x: 180, y: 20, width: canvas.width * 0.2, height: canvas.height * 0.15 };

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'green';
  ctx.font = 'bold 30px Arial';
  ctx.fillText(text, button.x + 10, button.y + 30);

  return button;
}
