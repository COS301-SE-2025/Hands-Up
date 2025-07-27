export function drawButton(canvas) {
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const button = { x: 100, y: 100, width: 100, height: 50 };

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#2D4D3A';
  ctx.fillRect(button.x, button.y, button.width, button.height);

  ctx.fillStyle = 'white';
  ctx.font = '16px Arial';
  ctx.fillText("Click Me", button.x + 10, button.y + 30);

  return button;
}
