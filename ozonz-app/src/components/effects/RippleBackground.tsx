import React, { useEffect, useRef } from 'react';
import { useReducedMotion, useIsMobile } from '../../hooks/useDevice';

export const RippleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const vertexShaderSource = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        v_texCoord.y = 1.0 - v_texCoord.y;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_spot;
      uniform float u_isDark;
      uniform float u_time;
      uniform float u_holdDown;
      uniform vec4 u_waves[30];
      uniform vec4 u_textRects[60];
      varying vec2 v_texCoord;

      void main() {
        vec2 px = v_texCoord * u_resolution;
        
        vec3 bgDark = vec3(0.063, 0.078, 0.102);
        float grad = clamp(v_texCoord.x * 0.5 + v_texCoord.y * 0.5, 0.0, 1.0);
        vec3 bgLight = mix(vec3(0.98, 0.965, 0.922), vec3(1.0, 0.992, 0.969), grad);
        
        vec2 mousePx = u_mouse * u_resolution;
        float spotDist = length(px - mousePx);

        float dimFactor = smoothstep(0.0, 0.2, u_holdDown);
        float spotlight = u_spot * exp(-spotDist * spotDist / (2.0 * 95.0 * 95.0)) * (1.0 - dimFactor * 0.9);

        float fusionProgress = clamp((u_holdDown - 2.0) / 3.0, 0.0, 1.0);
        float chargeGlow = 0.0;
        if (fusionProgress > 0.0) {
            float chargeRadius = 95.0 + fusionProgress * 150.0;
            chargeGlow = fusionProgress * exp(-spotDist * spotDist / (2.0 * chargeRadius * chargeRadius));
        }

        spotlight += chargeGlow * u_spot;

        float waveIntensity = 0.0;
        float darkSuppress = 0.0;
        float edgeBacklightAmount = 0.0;
        vec2 quakeDisplacement = vec2(0.0);

        for (int i = 0; i < 30; i++) {
            vec4 w = u_waves[i];
            if (w.z > 0.0) {
                float clickDist = length(px - w.xy * u_resolution);
                float extraPower = max(0.0, w.w - 1.5);
                float waveSpeed = max(300.0, 1000.0 - extraPower * 150.0);
                float waveFront = w.z * waveSpeed;
                float distFromFront = abs(clickDist - waveFront);
                
                float thickness = 800.0 + extraPower * 2000.0;
                float wave = exp(-distFromFront * distFromFront / thickness);
                
                float maxDist = 1200.0 + extraPower * 1500.0;
                float fadeDist = max(0.0, 1.0 - clickDist / maxDist);
                float ringLife = maxDist / waveSpeed;
                float fadeTime = smoothstep(ringLife, ringLife * 0.5, w.z);
                
                waveIntensity += wave * fadeDist * fadeTime * w.w;

                if (waveFront > clickDist) {
                    float edgeDistX = min(px.x, u_resolution.x - px.x);
                    float edgeDistY = min(px.y, u_resolution.y - px.y);
                    float minDistToEdge = min(edgeDistX, edgeDistY);
                    
                    float edgeZone = 150.0;
                    if (minDistToEdge < edgeZone) {
                        float timeSincePass = (waveFront - clickDist) / waveSpeed;
                        if (timeSincePass < 2.0) {
                            float edgeProfile = smoothstep(edgeZone, 0.0, minDistToEdge);
                            float fadeOut = smoothstep(2.0, 0.0, timeSincePass);
                            float backlight = edgeProfile * fadeOut * fadeDist * w.w * 0.15;
                            edgeBacklightAmount = max(edgeBacklightAmount, backlight);
                        }
                    }
                }

                if (extraPower > 0.0) {
                    vec2 dir = clickDist > 0.1 ? (px - w.xy * u_resolution) / clickDist : vec2(0.0);
                    quakeDisplacement += dir * wave * fadeDist * fadeTime * (extraPower * 4.0);
                }
                
                if (w.w > 0.4) {
                    float sDistScale = 100.0 + extraPower * 30.0;
                    float suppressDist = exp(-clickDist * clickDist / (2.0 * sDistScale * sDistScale));
                    float suppressDuration = 2.0 + extraPower * 1.5;
                    float suppressFade = smoothstep(suppressDuration, 0.0, w.z);
                    darkSuppress += suppressDist * suppressFade * 2.0;
                }
            }
        }

        float effectIntensity = max(0.0, spotlight - darkSuppress) + waveIntensity;

        float textGlow = 0.0;
        for (int i = 0; i < 60; i++) {
            vec4 r = u_textRects[i];
            if (r.z > 0.0) {
                vec2 d = abs(px - r.xy) - r.zw;
                float dist = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
                float glowRadius = 45.0;
                float distOutside = max(dist, 0.0);
                float intensity = 1.0 - smoothstep(0.0, glowRadius, distOutside);
                textGlow = max(textGlow, intensity);
            }
        }

        float spacing = 26.0;
        vec2 displacedPx = px + quakeDisplacement;
        vec2 cell = mod(displacedPx + spacing * 0.5, spacing) - spacing * 0.5;
        
        float baseSize = 1.6;
        float sizeBoost = 1.0 + min(1.5, effectIntensity * 1.2);
        float dotShape = 1.0 - smoothstep(0.0, baseSize * sizeBoost, length(cell));

        vec3 dotColorDimDark = vec3(0.35, 0.38, 0.45);
        vec3 dotColorDimLight = vec3(0.65, 0.62, 0.55);
        vec3 dotColorDim = mix(dotColorDimLight, dotColorDimDark, u_isDark);
        
        vec3 dotColorLitDark = vec3(3.0, 3.0, 3.0);
        vec3 dotColorLitLight = vec3(0.15, 0.35, 0.2);
        vec3 dotColorLit = mix(dotColorLitLight, dotColorLitDark, u_isDark);

        float dimDark = 0.25;
        float dimLight = 0.35;
        float dim = mix(dimLight, dimDark, u_isDark);
        float lit = dim + effectIntensity * mix(1.2, 2.0, u_isDark);
        
        float clampedEffect = clamp(effectIntensity, 0.0, 1.0);
        float brightness = mix(dim, lit, clampedEffect);
        vec3 dotColor = mix(dotColorDim, dotColorLit, clampedEffect);

        float textDimAmount = textGlow * mix(0.4, 0.7, u_isDark);
        brightness *= (1.0 - textDimAmount);

        vec3 textDimColor = mix(vec3(0.6, 0.6, 0.6), vec3(0.15, 0.15, 0.15), u_isDark);
        dotColor = mix(dotColor, textDimColor, textGlow * 0.5);
        dotShape *= (1.0 - textGlow * 0.5);

        vec3 colorDark = bgDark + dotColor * brightness * dotShape;
        vec3 colorLight = mix(bgLight, dotColor, brightness * dotShape);
        
        vec3 color = mix(colorLight, colorDark, u_isDark);
        vec3 bLightColor = mix(vec3(1.0, 1.0, 1.0), vec3(0.5, 0.7, 0.9), u_isDark);
        color += bLightColor * edgeBacklightAmount * 0.15;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    function createShader(type: number, source: string) {
      if (!gl) return null;
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    }

    const program = gl.createProgram();
    if (!program) return;

    const vs = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vs || !fs) return;

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const mouseLocation = gl.getUniformLocation(program, 'u_mouse');
    const spotLocation = gl.getUniformLocation(program, 'u_spot');
    const isDarkLocation = gl.getUniformLocation(program, 'u_isDark');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const wavesLocation = gl.getUniformLocation(program, 'u_waves');
    const holdDownLocation = gl.getUniformLocation(program, 'u_holdDown');
    const textRectsLocation = gl.getUniformLocation(program, 'u_textRects');

    const mouse = { x: 0.5, y: 0.5 };
    const target = { x: 0.5, y: 0.5 };
    let spot = 0;
    let targetSpot = 0;
    let pointerInside = false;
    let lastMoveTime = performance.now();

    const textRectsData = new Float32Array(60 * 4);
    let textElements: Element[] = [];

    function findTextElements() {
      textElements = Array.from(
        document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, .roles-tag, .group')
      ).filter((el) => {
        if (
          el.closest('.pixel-card') ||
          el.closest('#project-detail-modal') ||
          el.closest('#main-nav') ||
          el.closest('#theme-toggle') ||
          el.closest('#contact-links-container')
        ) {
          return false;
        }
        return true;
      });
    }

    const MAX_WAVES = 30;
    const waves = Array(MAX_WAVES)
      .fill(null)
      .map(() => ({ x: 0, y: 0, time: 0, intensity: 0 }));
    let waveIndex = 0;

    function addWave(x: number, y: number, intensity: number) {
      for (let i = 0; i < MAX_WAVES; i++) {
        const idx = (waveIndex + i) % MAX_WAVES;
        if (waves[idx].time === 0 || waves[idx].intensity <= 1.5 || intensity > 1.5) {
          waveIndex = idx;
          break;
        }
      }
      waves[waveIndex] = { x, y, time: 0.001, intensity };
      waveIndex = (waveIndex + 1) % MAX_WAVES;
    }

    let isMouseDown = false;
    let holdDownAmt = 0.0;
    let holdWaveTimer = 0.0;
    let lastTime = performance.now();
    let totalTime = 0.0;
    const lastTrailPos = { x: -1000, y: -1000 };

    const initialIsDark = document.documentElement.classList.contains('dark');
    let darkTransition = initialIsDark ? 1.0 : 0.0;

    function onMove(clientX: number, clientY: number) {
      lastMoveTime = performance.now();
      target.x = clientX / window.innerWidth;
      target.y = clientY / window.innerHeight;
      pointerInside = true;

      const dx = clientX - lastTrailPos.x;
      const dy = clientY - lastTrailPos.y;
      if (Math.sqrt(dx * dx + dy * dy) > (isMobile ? 50 : 30)) {
        addWave(target.x, target.y, 0.25);
        lastTrailPos.x = clientX;
        lastTrailPos.y = clientY;
      }
    }

    const handleMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) onMove(t.clientX, t.clientY);
    };
    const handleMouseLeave = () => {
      pointerInside = false;
      targetSpot = 0;
    };

    const handleMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      lastMoveTime = performance.now();
      addWave(e.clientX / window.innerWidth, e.clientY / window.innerHeight, 0.5);
    };
    const handleMouseUp = (e: MouseEvent) => {
      if (isMouseDown) {
        isMouseDown = false;
        lastMoveTime = performance.now();
        const extra = Math.max(0.0, holdDownAmt - 2.0);
        const power = 1.0 + extra * 2.0;
        addWave(e.clientX / window.innerWidth, e.clientY / window.innerHeight, power);
        holdDownAmt = 0.0;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) {
        isMouseDown = true;
        lastMoveTime = performance.now();
        addWave(t.clientX / window.innerWidth, t.clientY / window.innerHeight, 0.5);
      }
    };
    const handleTouchEnd = () => {
      if (isMouseDown) {
        isMouseDown = false;
        lastMoveTime = performance.now();
        const extra = Math.max(0.0, holdDownAmt - 2.0);
        const power = 1.0 + extra * 2.0;
        addWave(target.x, target.y, power);
        holdDownAmt = 0.0;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    function resizeCanvas() {
      if (!canvas || !gl) return;
      const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    const FPS_CAP = 1000 / 30; // 30fps cap
    let lastFrameTs = 0;
    let animId: number | null = null;
    let frameCount = 0;

    function render(ts: number) {
      if (document.hidden) {
        animId = null;
        return;
      }
      if (ts - lastFrameTs < FPS_CAP) {
        animId = requestAnimationFrame(render);
        return;
      }
      lastFrameTs = ts;
      const now = performance.now();
      const dt = (now - lastTime) / 1000.0;
      lastTime = now;
      totalTime += dt;

      if (isMouseDown) {
        holdDownAmt = Math.min(5.0, holdDownAmt + dt);
        holdWaveTimer += dt;
        if (holdWaveTimer >= 0.4) {
          addWave(target.x, target.y, 0.5);
          holdWaveTimer = 0.0;
        }
      } else {
        holdDownAmt = 0.0;
        holdWaveTimer = 0.0;
      }

      const wavesData = new Float32Array(MAX_WAVES * 4);
      for (let i = 0; i < MAX_WAVES; i++) {
        if (waves[i].time > 0.0) {
          waves[i].time += dt;
          const extraPower = Math.max(0.0, waves[i].intensity - 1.5);
          const waveSpeed = Math.max(300.0, 1000.0 - extraPower * 150.0);
          const maxDist = 1200.0 + extraPower * 1500.0;
          const ringLife = maxDist / waveSpeed;
          const suppressDuration = 2.0 + extraPower * 1.5;
          const maxLife = Math.max(ringLife, suppressDuration);

          if (waves[i].time > maxLife) {
            waves[i].time = 0;
          }
        }
        wavesData[i * 4 + 0] = waves[i].x;
        wavesData[i * 4 + 1] = waves[i].y;
        wavesData[i * 4 + 2] = waves[i].time;
        wavesData[i * 4 + 3] = waves[i].intensity;
      }

      frameCount++;
      if (frameCount % 45 === 1) {
        findTextElements();
      }

      textRectsData.fill(0);
      const limit = Math.min(textElements.length, 60);
      for (let i = 0; i < limit; i++) {
        const el = textElements[i] as HTMLElement;
        if (el.offsetWidth === 0 && el.offsetHeight === 0) continue;
        const r = el.getBoundingClientRect();
        textRectsData[i * 4 + 0] = r.left + r.width / 2;
        textRectsData[i * 4 + 1] = r.top + r.height / 2;
        textRectsData[i * 4 + 2] = r.width / 2;
        textRectsData[i * 4 + 3] = r.height / 2;
      }

      if (pointerInside) {
        const idleTime = (now - lastMoveTime) / 1000.0;
        if (idleTime > 3.0) {
          targetSpot = Math.max(0.0, 1.0 - (idleTime - 3.0) / 1.5);
        } else {
          targetSpot = 1.0;
        }
      } else {
        targetSpot = 0.0;
      }

      const lerp = pointerInside ? 0.14 : 0.06;
      mouse.x += (target.x - mouse.x) * lerp;
      mouse.y += (target.y - mouse.y) * lerp;
      spot += (targetSpot - spot) * 0.12;

      const currentIsDark = document.documentElement.classList.contains('dark');
      const targetDark = currentIsDark ? 1.0 : 0.0;
      darkTransition += (targetDark - darkTransition) * 0.1;

      if (!gl || !canvas) return;
      gl.useProgram(program);
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform2f(mouseLocation, mouse.x, mouse.y);
      gl.uniform1f(spotLocation, spot);
      gl.uniform1f(isDarkLocation, darkTransition);
      gl.uniform1f(timeLocation, totalTime);
      gl.uniform1f(holdDownLocation, holdDownAmt);
      if (wavesLocation) gl.uniform4fv(wavesLocation, wavesData);
      if (textRectsLocation) gl.uniform4fv(textRectsLocation, textRectsData);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);

    const onVisibilityChange = () => {
      if (!document.hidden && !animId) {
        resizeCanvas();
        lastTime = performance.now();
        animId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [reducedMotion, isMobile]);

  if (reducedMotion) return null;

  return <canvas id="bg-canvas" ref={canvasRef} aria-hidden="true" />;
};
