export function drawButton(canvas) {
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const button = { x: 100, y: 100, width: canvas.width * 0.1, height: canvas.height * 0.1 };

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#2D4D3A';
  ctx.fillRect(button.x, button.y, button.width, button.height);

  ctx.fillStyle = 'white';
  ctx.font = '16px Arial';
  ctx.fillText("Switch", button.x + 10, button.y + 30);

  return button;
}
