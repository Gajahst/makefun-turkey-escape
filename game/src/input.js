// Keyboard and mouse, folded into a few game actions.
// Arrows or WASD steer, Space/W/Up jumps, S/Down ducks (or hides in hay), Shift dashes.
// Mouse: left click jumps, right click ducks, and menus take clicks on their buttons.

const KEYMAP = {
  ArrowUp: 'jump', KeyW: 'jump', Space: 'jump',
  ArrowDown: 'duck', KeyS: 'duck',
  ArrowLeft: 'slow', KeyA: 'slow',
  ArrowRight: 'fast', KeyD: 'fast',
  ShiftLeft: 'dash', ShiftRight: 'dash', KeyK: 'dash',
  KeyP: 'pause', Escape: 'pause',
  KeyM: 'mute', KeyR: 'restart', Enter: 'confirm',
};

export function createInput(canvas, view) {
  const held = new Set();
  const pressed = new Set();
  const mouse = { x: 0, y: 0, clicked: false, down: false };

  const press = (action) => { if (!held.has(action)) pressed.add(action); held.add(action); };
  const release = (action) => held.delete(action);

  window.addEventListener('keydown', (e) => {
    const action = KEYMAP[e.code];
    if (!action) return;
    e.preventDefault();
    press(action);
  });
  window.addEventListener('keyup', (e) => {
    const action = KEYMAP[e.code];
    if (action) release(action);
  });
  window.addEventListener('blur', () => held.clear());

  const toView = (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - r.left) / r.width) * view.w;
    mouse.y = ((e.clientY - r.top) / r.height) * view.h;
  };
  canvas.addEventListener('mousemove', toView);
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  canvas.addEventListener('mousedown', (e) => {
    toView(e);
    if (e.button === 2) { press('duck'); return; }
    mouse.down = true;
    mouse.clicked = true;
    press('jump');
  });
  window.addEventListener('mouseup', (e) => {
    if (e.button === 2) release('duck');
    else { mouse.down = false; release('jump'); }
  });

  return {
    mouse,
    isHeld: (action) => held.has(action),
    wasPressed: (action) => pressed.has(action),
    // Called once at the end of every frame.
    endFrame() { pressed.clear(); mouse.clicked = false; },
  };
}
