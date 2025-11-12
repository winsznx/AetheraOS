import { useEffect, useRef } from 'react';

/**
 * Agent Flow Animation
 * Visualizes AI agents discovering and executing tasks through binary flow patterns
 * Represents the autonomous nature of the AetheraOS agent economy
 */
export default function AgentFlowAnimation() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let width = 50;
    let height = 50;
    let grid = [];
    let time = 0;
    let animationFrameId;

    // Initialize grid - empty state awaiting agent tasks
    function initGrid() {
      grid = [];
      for (let y = 0; y < height; y++) {
        let row = [];
        for (let x = 0; x < width; x++) {
          row.push(' ');
        }
        grid.push(row);
      }
    }

    // Render grid to DOM
    function render() {
      let html = '';
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          html += grid[y][x];
        }
        html += '<br>';
      }
      canvas.innerHTML = html;
    }

    // Update animation frame
    function update() {
      initGrid();

      // Central hub - represents Edenlayer registry
      const hubSize = 20;
      const hubX = Math.floor(width / 2 - hubSize / 2);
      const hubY = Math.floor(height / 2 - hubSize / 2);

      // Time-based flow
      const t = time * 0.008;

      // Draw agent discovery and task execution patterns
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          // Central registry hub
          if (x >= hubX && x < hubX + hubSize &&
              y >= hubY && y < hubY + hubSize) {
            const innerDist = Math.min(
              x - hubX,
              hubX + hubSize - x,
              y - hubY,
              hubY + hubSize - y
            );

            // Pulsing registry core
            const pulse = time * 0.01;
            if (innerDist > pulse % 8) {
              grid[y][x] = '█';
            } else {
              grid[y][x] = Math.random() > 0.7 ? '█' : '▓';
            }
          } else {
            // Agent flow patterns - discovering and claiming tasks
            const dx = x - width / 2;
            const dy = y - height / 2;
            const angle = Math.atan2(dy, dx);
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Create flowing agent patterns
            const wave = Math.sin(dist * 0.3 - t + angle * 2);
            const flow = Math.sin(x * 0.1 + y * 0.05 + t * 0.6);

            // Agents moving outward from registry
            if (flow + wave > 0.5) {
              grid[y][x] = '○'; // Available tasks
            } else if (flow + wave > 0.2) {
              grid[y][x] = '●'; // Claimed tasks
            } else if (flow + wave < -0.5) {
              grid[y][x] = '·'; // Completed tasks
            }
          }
        }
      }

      // Add data streams between agents and hub
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + t * 0.3;
        const streamLength = 15 + Math.sin(t + i) * 5;

        for (let j = 0; j < streamLength; j++) {
          const cx = Math.floor(width / 2 + Math.cos(angle) * (hubSize / 2 + j));
          const cy = Math.floor(height / 2 + Math.sin(angle) * (hubSize / 2 + j));

          if (cx >= 0 && cx < width && cy >= 0 && cy < height) {
            grid[cy][cx] = j % 3 === 0 ? '→' : '-';
          }
        }
      }

      time++;
    }

    function animate() {
      update();
      render();
      animationFrameId = requestAnimationFrame(animate);
    }

    initGrid();
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (canvas) {
        canvas.innerHTML = '';
      }
      grid = [];
      time = 0;
    };
  }, []);

  return (
    <div className="hidden lg:flex items-center justify-center h-full">
      <div
        ref={canvasRef}
        className="text-xs leading-tight tracking-wider text-gray-700 dark:text-gray-300 opacity-40 hover:opacity-60 transition-opacity duration-500 select-none font-mono"
        style={{
          lineHeight: '0.9',
          letterSpacing: '0.05em',
        }}
      />
    </div>
  );
}
