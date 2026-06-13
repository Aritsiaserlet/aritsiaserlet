# 🌬️ Wind VFX Plan — Anti-Gravity Portfolio Background

## ภาพรวม (Vision)

ใช้ภาพ Anime Background ที่มีตัวละครลอยอยู่กลางอากาศเป็น background หลัก
แล้วซ้อน VFX Wind Effect ที่ลอยขึ้นจากด้านล่างของหน้าจอ ขึ้นไปด้านบน
ให้รู้สึกเหมือนลมกำลังพัด ตัวละครลอยอยู่ใน anti-gravity zone

---

## 🎨 Aesthetic Reference จากภาพ

| Element       | รายละเอียด                                        |
|--------------|--------------------------------------------------|
| Color Palette | Sky blue `#4FA8D5`, Cloud white `#EAF3FA`, Soft purple `#8B7FC8`, Warm earth `#C4A882` |
| Mood          | Dreamy, weightless, anime-cinematic              |
| Style         | Soft painterly + pixel accent                   |
| Motion Feel   | Gentle, flowing upward — ไม่ใช่ Storm แต่เป็น Breeze ที่ anti-gravity |

---

## 🧩 VFX Components ที่ต้องสร้าง

### 1. Wind Streaks (เส้นลม)
- เส้นบาง ๆ โค้งเล็กน้อย ลอยขึ้นจากล่างไปบน
- สีขาว/ฟ้าอ่อน opacity ต่ำ (0.1 – 0.4)
- Speed: ช้า–กลาง, staggered timing
- จำนวน: 15–25 เส้น กระจายทั่วหน้าจอ

### 2. Floating Particles (อนุภาคลอย)
- จุดกลม ๆ เล็ก หรือ teardrop shape
- สี: ขาวนวล, ฟ้าอ่อน, ม่วงอ่อน (match กับ purple pixel blocks ในภาพ)
- Motion: ลอยขึ้น + drift ซ้ายขวาเล็กน้อย (sine wave)
- บางส่วน glow เบา ๆ

### 3. Leaf/Petal Silhouettes (ไม่บังคับ)
- รูปทรงคล้ายใบไม้ขนาดเล็ก หมุน + ลอยขึ้น
- เหมาะกับ Ghibli/Anime vibe ของภาพ

### 4. Ambient Cloud Wisps (เมฆฝอย)
- เมฆบาง ๆ เคลื่อนช้ามาก จาก bottom ขึ้น top
- blur สูง, opacity 0.05–0.15
- ให้รู้สึก depth

---

## 📐 Technical Spec

```
Canvas: fullscreen (100vw × 100vh)
Renderer: HTML5 Canvas API หรือ CSS Animation + SVG
Layer: position: fixed; z-index บนสุด; pointer-events: none
Responsive: ปรับ density ตาม viewport width
Performance: requestAnimationFrame loop, max 60fps
Reduced Motion: ถ้า prefers-reduced-motion → ลด particle count 80%
```

---

## 🤖 Prompt สำหรับส่งให้ Claude Sonnet 4.6

```
You are an expert frontend developer specializing in canvas-based VFX animations.

Create a beautiful, performant Wind VFX effect for a portfolio website background.
The background image is an anime-style illustration of a character floating in the sky
with clouds, a blue sky (#4FA8D5), and purple pixel block elements.

## What to build:
A fullscreen overlay canvas (position: fixed, pointer-events: none, z-index: 999)
with wind particles rising from the bottom of the screen to the top.

## Visual requirements:
- Color palette: white (#FFFFFF), sky blue (#B8D9F0), soft purple (#C4B5E8), pale cream (#F0EDE8)
- 3 layers of elements:
  1. WIND STREAKS: 20 thin curved lines (2–3px wide), opacity 0.08–0.25,
     moving upward at different speeds (0.5–2px/frame), slight horizontal drift
  2. FLOAT PARTICLES: 40 small circles (2–6px radius) and soft glowing orbs,
     rising with sine-wave lateral motion, opacity 0.15–0.5
  3. CLOUD WISPS: 5–8 large soft ellipses (blur: high), moving very slowly upward,
     opacity 0.03–0.1, color: white/pale blue

## Motion feel:
- Anti-gravity, dreamy, weightless — NOT stormy or chaotic
- Staggered start times so elements don't all move in sync
- Elements wrap: when they leave the top, reset to a random x position at the bottom
- Gentle easing (sine curve for lateral movement)

## Technical requirements:
- Pure HTML + CSS + Vanilla JavaScript (no libraries)
- Uses requestAnimationFrame for smooth 60fps animation
- Responsive: recalculate canvas size on window resize
- Respects prefers-reduced-motion: reduce particle count by 80% if true
- All elements defined in a config object at the top for easy tuning

## Output format:
Return a single self-contained HTML file with:
- <canvas> element covering the full viewport
- All JS inside <script> tags
- Brief comments explaining each layer
- A config object at the top with: particleCount, streakCount, colors, speedRange, opacityRange

The result should feel like the character in the image is creating an upward wind
as they float — magical, light, and cinematic.
```

---

## 🔧 Config Object ที่ควรมีใน Output

```javascript
const CONFIG = {
  streaks: {
    count: 20,
    color: ['#FFFFFF', '#B8D9F0'],
    speedRange: [0.5, 2.0],
    opacityRange: [0.08, 0.25],
    widthRange: [1, 3],
    curveAmount: 30,
  },
  particles: {
    count: 40,
    color: ['#FFFFFF', '#C4B5E8', '#B8D9F0'],
    speedRange: [0.3, 1.5],
    sizeRange: [2, 6],
    glowCount: 10,       // subset ที่มี glow
    sineAmplitude: 20,   // lateral drift
    sineFrequency: 0.02,
  },
  wisps: {
    count: 6,
    color: ['#FFFFFF', '#EAF3FA'],
    speedRange: [0.1, 0.4],
    opacityRange: [0.03, 0.1],
    blurRange: [20, 50],
  },
  performance: {
    targetFPS: 60,
    reducedMotionMultiplier: 0.2,
  }
}
```

---

## 🗂️ Integration กับ Portfolio

```html
<!-- วางใน <body> ของ portfolio -->
<img src="background.png" class="bg-image" alt="" />
<canvas id="wind-vfx"></canvas>

<!-- CSS -->
<style>
  .bg-image {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 0;
  }
  #wind-vfx {
    position: fixed;
    inset: 0;
    z-index: 999;
    pointer-events: none;
  }
</style>
```

---

## ✅ Checklist ก่อน Deploy

- [ ] VFX ไม่บัง content หลัก (pointer-events: none)
- [ ] ทดสอบบน mobile (particle count ลดอัตโนมัติ)
- [ ] ทดสอบ reduced-motion preference
- [ ] ไม่มี memory leak (cleanup on unmount ถ้าใช้ framework)
- [ ] FPS ไม่ตก (devtools Performance tab)
- [ ] สีกลมกลืนกับ background image

---

*Plan version 1.0 — Generated for Anti-Gravity Portfolio VFX*
