/** A locally drawn starting map uses the same PNG contract as an uploaded map. */
let cached: string | undefined;

export function simpleFoundingMap(): string {
  if (cached) return cached;
  const canvas = document.createElement("canvas");
  canvas.width = 1536;
  canvas.height = 1024;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("A simple map could not be created. Upload artwork instead.");
  context.fillStyle = "#cbd8c2";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "#b3c5ad";
  context.lineWidth = 2;
  for (let x = 0; x <= canvas.width; x += 128) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
    context.stroke();
  }
  for (let y = 0; y <= canvas.height; y += 128) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
    context.stroke();
  }
  cached = canvas.toDataURL("image/png");
  return cached;
}
