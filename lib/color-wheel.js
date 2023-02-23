class ColorWheelPicker {
    constructor(element) {
      this.element = element;
      this.canvas = document.createElement('canvas');
      this.canvas.width = this.element.offsetWidth;
      this.canvas.height = this.element.offsetHeight;
      this.ctx = this.canvas.getContext('2d');
  
      this.element.appendChild(this.canvas);
  
      this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
      this.element.addEventListener('touchstart', this.handleTouchStart.bind(this));
      document.addEventListener('mouseup', this.handleMouseUp.bind(this));
      document.addEventListener('touchend', this.handleTouchEnd.bind(this));
  
      this.color = new Color();
      this.hue = 0;
  
      this.draw();
    }
  
    setColor(color) {
      this.color = color;
      const hsl = color.toHsl();
      this.hue = hsl.h;
      this.draw();
      if (typeof this.onColorChange === 'function') {
        this.onColorChange(color);
      }
    }
  
    draw() {
      const centerX = this.canvas.width / 2;
      const centerY = this.canvas.height / 2;
      const radius = Math.min(centerX, centerY);
  
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  
      // Draw color wheel
      for (let angle = 0; angle < 360; angle++) {
        const startAngle = (angle - 2) * Math.PI / 180;
        const endAngle = angle * Math.PI / 180;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        this.ctx.closePath();
  
        const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, `hsl(${angle}, 100%, 50%)`);
        gradient.addColorStop(1, `hsl(${angle}, 100%, 50%)`);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
      }
  
      // Draw hue marker
      const angle = this.hue;
      const markerX = centerX + radius * Math.cos(angle * Math.PI / 180);
      const markerY = centerY + radius * Math.sin(angle * Math.PI / 180);
  
      this.ctx.beginPath();
      this.ctx.arc(markerX, markerY, radius / 10, 0, 2 * Math.PI);
      this.ctx.strokeStyle = 'white';
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
  
      this.ctx.beginPath();
      this.ctx.arc(markerX, markerY, radius / 10, 0, 2 * Math.PI);
      this.ctx.strokeStyle = 'black';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }
  
    handleMouseDown(event) {
      this.handleColorChange(event);
      document.addEventListener('mousemove', this.handleMouseMove);
    }
  
    handleMouseMove(event) {
      this.handleColorChange(event);
    }
  
    handleMouseUp() {
      document.removeEventListener('mousemove', this.handleMouseMove);
    }
  
    handleTouchStart(event) {
      this.handleColorChange(event.touches[0]);
      document.addEventListener('touchmove', this.handleTouchMove.bind(this));
    }
  
    handleTouchMove(event) {
      event.preventDefault();
      this.handleColorChange(event.touches[0]);
    }
  
    handleTouchEnd() {
      document.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    }
  
    handleColorChange(event) {
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event
      const centerX = this.canvas.width / 2;
      const centerY = this.canvas.height / 2;
      const radius = Math.min(centerX, centerY);
  
      const dx = x - centerX;
      const dy = y - centerY;
      const angle = Math.atan2(dy, dx);
      this.hue = (angle * 180 / Math.PI + 360) % 360;
  
      this.color.setHue(this.hue);
      this.draw();
      if (typeof this.onColorChange === 'function') {
        this.onColorChange(this.color);
      }
    }
  }
    