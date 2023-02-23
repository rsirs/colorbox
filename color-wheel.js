export class ColorWheelPicker {
    constructor(container, width = 300, height = 300) {
        this.width = width;
        this.height = height;
        this.container = container;
        this.canvas = document.createElement('canvas');
        this.container.appendChild(this.canvas);
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.context = this.canvas.getContext('2d');
        this.selectedColor = new Color('#ff0000');
        this.drawWheel();
        this.canvas.addEventListener('click', event => {
            const x = event.offsetX;
            const y = event.offsetY;
            const imageData = this.context.getImageData(x, y, 1, 1);
            const color = new Color(imageData.data[0], imageData.data[1], imageData.data[2]);
            this.selectedColor = color;
            this.drawWheel();
            this.onSelect(color);
        });
    }

    drawWheel() {
        this.context.clearRect(0, 0, this.width, this.height);
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = this.width / 2;
        const imageData = this.context.getImageData(0, 0, this.width, this.height);
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < radius) {
                    const angle = Math.atan2(dy, dx);
                    let hue = angle / (2 * Math.PI);
                    if (hue < 0) {
                        hue += 1;
                    }
                    const saturation = distance / radius;
                    const lightness = 0.5;
                    const color = new Color().setHSL(hue, saturation, lightness);
                    const index = (y * this.width + x) * 4;
                    imageData.data[index] = color.red;
                    imageData.data[index + 1] = color.green;
                    imageData.data[index + 2] = color.blue;
                    imageData.data[index + 3] = 255;
                }
            }
        }
        this.context.putImageData(imageData, 0, 0);
        this.drawSelectedColor();
    }

    drawSelectedColor() {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = (this.width / 2) * this.selectedColor.getSaturation();
        const angle = this.selectedColor.getHue() * 2 * Math.PI;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        this.context.strokeStyle = '#000000';
        this.context.beginPath();
        this.context.arc(x, y, 10, 0, 2 * Math.PI);
        this.context.stroke();
    }

    setColor(color) {
        this.selectedColor = color;
        this.drawWheel();
    }

    onSelect(callback) {
        this.onSelectCallback = callback;
    }
}
