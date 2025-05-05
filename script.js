window.onload = function () {
  const canvas = document.getElementById('waveCanvas');
  const ctx = canvas.getContext('2d');

  const heightSlider = document.getElementById('height');
  const frequencySlider = document.getElementById('frequency');
  const speedSlider = document.getElementById('speed');
  const thicknessSlider = document.getElementById('thickness');

  const waveColorButtons = document.querySelectorAll('.wave-color');
  const bgColorButtons = document.querySelectorAll('.bg-color');

  let waveHeight = parseFloat(heightSlider.value);
  let frequency = parseFloat(frequencySlider.value);
  let speed = parseFloat(speedSlider.value);
  let thickness = parseFloat(thicknessSlider.value);

  let waveColor = 'rgba(64, 224, 208, 0.5)';
  let bgColor = '#ffffff';

  let offset = 0;
  let volumeBoost = 0;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  function updateSettings() {
    waveHeight = parseFloat(heightSlider.value);
    frequency = parseFloat(frequencySlider.value);
    speed = parseFloat(speedSlider.value);
    thickness = parseFloat(thicknessSlider.value);
  }

  heightSlider.addEventListener('input', updateSettings);
  frequencySlider.addEventListener('input', updateSettings);
  speedSlider.addEventListener('input', updateSettings);
  thicknessSlider.addEventListener('input', updateSettings);

  waveColorButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      waveColor = hexToRgba(btn.dataset.color, 0.5);
    });
  });

  bgColorButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      bgColor = btn.dataset.color;
    });
  });

  function hexToRgba(hex, alpha) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function drawWaves() {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const numWaves = 12;
    const spacing = canvas.height / numWaves;

    for (let i = 0; i < numWaves; i++) {
      const localOffset = offset * (1 - 0.05 * (numWaves - 1 - i));
      const waveY = spacing * (i + 0.5);
      const waveLength = canvas.width / frequency;

      ctx.beginPath();
      ctx.moveTo(0, waveY);

      for (let x = 0; x < canvas.width; x++) {
        const y = waveY + Math.sin((x + localOffset) / waveLength * Math.PI * 2) * (waveHeight + volumeBoost * 8);
        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = waveColor;
      ctx.lineWidth = thickness;
      ctx.stroke();
    }

    offset += speed * 2;
  }

  function animate() {
    drawWaves();
    requestAnimationFrame(animate);
  }

  function setupMicInput() {
    navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(stream => {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      source.connect(analyser);

      function analyze() {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b) / bufferLength;
        volumeBoost = avg / 5;
        requestAnimationFrame(analyze);
      }

      analyze();
    }).catch(err => {
      console.error('Microphone access denied or not supported.', err);
    });
  }

  setupMicInput();
  animate();
};
