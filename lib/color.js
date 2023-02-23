
export class Color {
    constructor(value = '#000000') {
        this.set(value);
    }

    set(value) {
        const regex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
        if (typeof value === "string") {
            if (value.match(regex)) {
                // HEX
                this._rgb = {
                    r: parseInt(value.substr(1, 2), 16),
                    g: parseInt(value.substr(3, 2), 16),
                    b: parseInt(value.substr(5, 2), 16),
                };
            } else if (value.startsWith("rgb")) {
                // RGB
                const rgb = value.match(/(\d{1,3})/g);
                this._rgb = {
                    r: parseInt(rgb[0]),
                    g: parseInt(rgb[1]),
                    b: parseInt(rgb[2]),
                };
            } else if (value.startsWith("hsl")) {
                // HSL
                const hsl = value.match(/(\d{1,3})/g);
                const h = parseInt(hsl[0]) / 360;
                const s = parseInt(hsl[1]) / 100;
                const l = parseInt(hsl[2]) / 100;
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
                const g = Math.round(hue2rgb(p, q, h) * 255);
                const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
                this._rgb = { r, g, b };
            } else if (value.startsWith("cmyk")) {
                // CMYK
                const cmyk = value.match(/(\d{1,3})/g);
                const c = cmyk[0] / 100;
                const m = cmyk[1] / 100;
                const y = cmyk[2] / 100;
                const k = cmyk[3] / 100;
                const r = Math.round(255 * (1 - c) * (1 - k));
                const g = Math.round(255 * (1 - m) * (1 - k));
                const b = Math.round(255 * (1 - y) * (1 - k));
                this._rgb = { r, g, b };
            }
        } else if (typeof value === "object") {
            this._rgb = {
                r: parseInt(value.r),
                g: parseInt(value.g),
                b: parseInt(value.b),
            };
        }
    }

    get rgb() {
        return this._rgb;
    }

    get hex() {
        const r = this._rgb.r.toString(16).padStart(2, "0");
        const g = this._rgb.g.toString(16).padStart(2, "0");
        const b = this._rgb.b.toString(16).padStart(2, "0");
        return `#${r}${g}${b}`;
    }

    get hsl() {
        const r = this._rgb.r / 255;
        const g = this._rgb.g / 255;
        const b = this._rgb.b / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l;
        if (max === min) {
            h = 0;
        } else if (max === r) {
            h = 60 * ((g - b) / (max - min));
        } else if (max === g) {
            h = 60 * ((b - r) / (max - min)) + 120;
        } else {
            h = 60 * ((r - g) / (max - min)) + 240;
        }
        if (h < 0) {
            h += 360;
        }
        l = (max + min) / 2;
        if (max === min) {
            s = 0;
        } else if (l <= 0.5) {
            s = (max - min) / (2 * l);
        } else {
            s = (max - min) / (2 - 2 * l);
        }
        s *= 100;
        l *= 100;
        return { h: Math.round(h), s: Math.round(s), l: Math.round(l) };
    }

    get cmyk() {
        const r = this._rgb.r / 255;
        const g = this._rgb.g / 255;
        const b = this._rgb.b / 255;
        const k = 1 - Math.max(r, g, b);
        if (k === 1) {
            return { c: 0, m: 0, y: 0, k: 100 };
        }
        const c = (1 - r - k) / (1 - k);
        const m = (1 - g - k) / (1 - k);
        const y = (1 - b - k) / (1 - k);
        return {
            c: Math.round(c * 100),
            m: Math.round(m * 100),
            y: Math.round(y * 100),
            k: Math.round(k * 100),
        };
    }

    static convert(fromFormat, toFormat) {
        const color = new Color(fromFormat);
        const formats = ["hex", "rgb", "hsl", "cmyk"];
        if (!formats.includes(fromFormat) || !formats.includes(toFormat)) {
            throw new Error("Invalid color format");
        }
        if (fromFormat === toFormat) {
            return color;
        }
        return color[toFormat];
    }

    /*
    *Returns a new color that is lighter than the current color by the given amount. The amount should be a percentage between 0 and 100.
    */
    lighten(amount) {
        const hsl = this.hsl;
        const newL = Math.min(hsl.l + amount, 100);
        return new Color(`hsl(${hsl.h}, ${hsl.s}%, ${newL}%)`);
    }

    /**
     * Returns a new color that is darker than the current color by the given amount. The amount should be a percentage between 0 and 100.
     */
    darken(amount) {
        const hsl = this.hsl;
        const newL = Math.max(hsl.l - amount, 0);
        return new Color(`hsl(${hsl.h}, ${hsl.s}%, ${newL}%)`);
    }

    saturate(amount) {
        const hsl = this.hsl;
        const newS = Math.min(hsl.s + amount, 100);
        return new Color(`hsl(${hsl.h}, ${newS}%, ${hsl.l}%)`);
    }

    desaturate(amount) {
        const hsl = this.hsl;
        const newS = Math.max(hsl.s - amount, 0);
        return new Color(`hsl(${hsl.h}, ${newS}%, ${hsl.l}%)`);
    }

    invert() {
        const r = 255 - this._rgb.r;
        const g = 255 - this._rgb.g;
        const b = 255 - this._rgb.b;
        return new Color({ r, g, b });
    }

    mix(color, weight) {
        const w = Math.max(Math.min(weight, 1), 0);
        const r = Math.round(this._rgb.r * (1 - w) + color._rgb.r * w);
        const g = Math.round(this._rgb.g * (1 - w) + color._rgb.g * w);
        const b = Math.round(this._rgb.b * (1 - w) + color._rgb.b * w);
        return new Color({ r, g, b });
    }

    equals(color) {
        return this._rgb.r === color._rgb.r &&
            this._rgb.g === color._rgb.g &&
            this._rgb.b === color._rgb.b;
    }

    isLight() {
        return this.hsl.l > 50;
    }

    isDark() {
        return this.hsl.l <= 50;
    }

    contrast(color) {
        const l1 = this.hsl.l;
        const l2 = color.hsl.l;
        const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        return Math.round(ratio * 100) / 100;
    }

    getRed() {
        return this._rgb.r;
    }

    getGreen() {
        return this._rgb.g;
    }

    getBlue() {
        return this._rgb.b;
    }

    getHue() {
        return this.hsl.h;
    }

    getSaturation() {
        return this.hsl.s;
    }

    getLightness() {
        return this.hsl.l;
    }

    getCyan() {
        return this.cmyk.c;
    }

    getMagenta() {
        return this.cmyk.m;
    }

    getYellow() {
        return this.cmyk.y;
    }

    getBlack() {
        return this.cmyk.k;
    }

    /**
     * This method first creates a Color object for black (#000000) and white (#ffffff), and then determines the lightness value that is halfway between black and white (50%). It then creates two colors with the same hue and saturation as the current color, but with lightness values of l1 and l2, respectively. It then calculates the contrast ratio between each of these colors and black, and chooses the color that has the highest contrast ratio. Finally, it checks which of the two chosen colors has the highest contrast ratio with the original color, and returns that color as the one with the best contrast.
     * This method can be useful for generating text or other graphical elements with good contrast against a given background color.
     */
    getBestContrastColor() {
        const black = new Color("#000000");
        const white = new Color("#ffffff");
        const l1 = this.hsl.l;
        const l2 = 50; // halfway between black and white
        const h = this.hsl.h;
        const s = this.hsl.s;
        let color1 = new Color(`hsl(${h}, ${s}%, ${l1}%)`);
        let color2 = new Color(`hsl(${h}, ${s}%, ${l2}%)`);
        let contrast1 = color1.contrast(black);
        let contrast2 = color2.contrast(black);
        if (contrast1 < contrast2) {
            color1 = white.mix(color1, 0.5);
        } else {
            color2 = white.mix(color2, 0.5);
        }
        return (color1.contrast(this) > color2.contrast(this)) ? color1 : color2;
    }


    /**
     * This method takes a Color object as an argument, which is used as the second color for the contrast calculation. It then proceeds in the same way as the previous implementation, except that it calculates the contrast ratio between the two colors, and adjusts both colors as necessary to achieve a contrast ratio of at least 4.5 (which is the minimum recommended contrast ratio for text according to the WCAG 2.0 guidelines). The method returns the color that has the highest contrast ratio with the original color.
     * This method can be useful for generating text or other graphical elements with good contrast against a given background color, while taking into account a second color that may be present in the design.
     */
    getBestContrastColor(color2) {
        const black = new Color("#000000");
        const white = new Color("#ffffff");
        const l1 = this.hsl.l;
        const l2 = color2.hsl.l;
        const h = this.hsl.h;
        const s = this.hsl.s;
        let color1 = new Color(`hsl(${h}, ${s}%, ${l1}%)`);
        let color2 = new Color(`hsl(${h}, ${s}%, ${l2}%)`);
        let contrast1 = color1.contrast(black);
        let contrast2 = color2.contrast(black);
        if (contrast1 < contrast2) {
            color1 = white.mix(color1, 0.5);
        } else {
            color2 = white.mix(color2, 0.5);
        }
        let contrast3 = color1.contrast(color2);
        while (contrast3 < 4.5) {
            if (color1.contrast(this) > color2.contrast(this)) {
                color2 = color2.lighten(5);
            } else {
                color1 = color1.lighten(5);
            }
            contrast3 = color1.contrast(color2);
        }
        return (color1.contrast(this) > color2.contrast(this)) ? color1 : color2;
    }


    static isValid(color) {
        return /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color);
    }

    toHexString() {
        return `#${this._rgb.r.toString(16)}${this._rgb.g.toString(16)}${this._rgb.b.toString(16)}`;
    }

    toCssString() {
        return `rgb(${this._rgb.r}, ${this._rgb.g}, ${this._rgb.b})`;
    }

    toString() {
        return `Color [r=${this._rgb.r}, g=${this._rgb.g}, b=${this._rgb.b}]`;
    }

    blend(color, amount) {
        const rgb = {
            r: Math.round((1 - amount) * this._rgb.r + amount * color._rgb.r),
            g: Math.round((1 - amount) * this._rgb.g + amount * color._rgb.g),
            b: Math.round((1 - amount) * this._rgb.b + amount * color._rgb.b),
        };
        return new Color(rgb);
    }

    complement() {
        return new Color(`hsl(${(this.hsl.h + 180) % 360}, ${this.hsl.s}%, ${this.hsl.l}%)`);
    }

    getBrightness() {
        const r = this._rgb.r / 255;
        const g = this._rgb.g / 255;
        const b = this._rgb.b / 255;
        return Math.sqrt(0.299 * r * r + 0.587 * g * g + 0.114 * b * b);
    }

    isLightColor() {
        return this.getBrightness() > 0.5;
    }

    isDarkColor() {
        return this.getBrightness() <= 0.5;
    }

    getGrayscaleEquivalent() {
        const l = this.hsl.l;
        return new Color(`hsl(0, 0%, ${l}%)`);
    }

    getAnalogousColors() {
        const h = this.hsl.h;
        const s = this.hsl.s;
        const l = this.hsl.l;
        return [
            new Color(`hsl(${(h - 30 + 360) % 360}, ${s}%, ${l}%)`),
            new Color(`hsl(${(h + 30) % 360}, ${s}%, ${l}%)`),
            new Color(`hsl(${(h + 60) % 360}, ${s}%, ${l}%)`),
        ];
    }

    getTriadicColors() {
        const h = this.hsl.h;
        const s = this.hsl.s;
        const l = this.hsl.l;
        return [
            new Color(`hsl(${(h + 120) % 360}, ${s}%, ${l}%)`),
            new Color(`hsl(${(h + 240) % 360}, ${s}%, ${l}%)`),
        ];
    }

    getSplitComplementaryColors() {
        const h = this.hsl.h;
        const s = this.hsl.s;
        const l = this.hsl.l;
        return [
            new Color(`hsl(${(h + 150) % 360}, ${s}%, ${l}%)`),
            new Color(`hsl(${(h + 210) % 360}, ${s}%, ${l}%)`),
        ];
    }

    getTetradicColors() {
        const h = this.hsl.h;
        const s = this.hsl.s;
        const l = this.hsl.l;
        return [
            new Color(`hsl(${(h + 90) % 360}, ${s}%, ${l}%)`),
            new Color(`hsl(${(h + 180) % 360}, ${s}%, ${l}%)`),
            new Color(`hsl(${(h + 270) % 360}, ${s}%, ${l}%)`),
        ];
    }

    getComplementaryColors() {
        const h = this.hsl.h;
        const s = this.hsl.s;
        const l = this.hsl.l;
        return [
            new Color(`hsl(${(h + 180) % 360}, ${s}%, ${l}%)`),
        ];
    }

    getAnalogousColors(numColors) {
        const h = this.hsl.h;
        const s = this.hsl.s;
        const l = this.hsl.l;
        const step = 30;
        const colors = [];
        for (let i = 0; i < numColors; i++) {
            colors.push(new Color(`hsl(${(h + i * step + 360) % 360}, ${s}%, ${l}%)`));
        }
        return colors;
    }

    getGradientColors(color2, numColors) {
        const colors = [this];
        const step = 1 / (numColors - 1);
        for (let i = 1; i < numColors - 1; i++) {
            colors.push(this.mix(color2, i * step));
        }
        colors.push(color2);
        return colors;
    }


    getComplementaryScheme() {
        return [this, this.complement()];
    }

    getAnalogousScheme(numColors) {
        const colors = this.getAnalogousColors(numColors - 1);
        colors.unshift(this);
        return colors;
    }

    getTriadicScheme() {
        return [this, ...this.getTriadicColors()];
    }

    getSplitComplementaryScheme() {
        return [this, ...this.getSplitComplementaryColors()];
    }

    getTetradicScheme() {
        return [this, ...this.getTetradicColors()];
    }

    getMonochromaticScheme(numColors) {
        const colors = [this];
        const step = 1 / (numColors - 1);
        for (let i = 1; i < numColors; i++) {
            colors.push(this.lighten(i * step));
        }
        return colors;
    }

    getWarmColor() {
        const h = this.hsl.h;
        const s = this.hsl.s;
        const l = this.hsl.l;
        if (h < 60 || h >= 300) {
            return new Color(`hsl(${h}, ${s}%, ${l}%)`);
        } else if (h < 180) {
            return new Color(`hsl(${h + 60}, ${s}%, ${l}%)`);
        } else {
            return new Color(`hsl(${h - 60}, ${s}%, ${l}%)`);
        }
    }

    getCoolColor() {
        const h = this.hsl.h;
        const s = this.hsl.s;
        const l = this.hsl.l;
        if (h >= 60 && h < 240) {
            return new Color(`hsl(${h}, ${s}%, ${l}%)`);
        } else if (h < 60) {
            return new Color(`hsl(${h + 180}, ${s}%, ${l}%)`);
        } else {
            return new Color(`hsl(${h - 180}, ${s}%, ${l}%)`);
        }
    }

    getRandomColor(range) {
        const h = this.hsl.h;
        const s = this.hsl.s;
        const l = this.hsl.l;
        const randomH = Math.floor(Math.random() * range * 2) - range;
        const newH = (h + randomH + 360) % 360;
        return new Color(`hsl(${newH}, ${s}%, ${l}%)`);
    }

    getReadableTextColor(bgColor) {
        const contrast1 = this.contrast(bgColor);
        const contrast2 = this.contrast(Color.BLACK, bgColor);
        if (contrast1 >= 4.5 || contrast2 >= 4.5) {
            return this.isLight() ? Color.BLACK : Color.WHITE;
        } else {
            return this.isLight() ? Color.WHITE : Color.BLACK;
        }
    }

    static get BLACK() {
        return new Color('#000000');
    }

    static get WHITE() {
        return new Color('#ffffff');
    }


    getContrastingColor() {
        const contrast1 = this.contrast(Color.BLACK);
        const contrast2 = this.contrast(Color.WHITE);
        return contrast1 > contrast2 ? Color.BLACK : Color.WHITE;
    }

    getGrayscaleColor() {
        const l = this.hsl.l;
        return new Color(`hsl(0, 0%, ${l}%)`);
    }

    getLighterColor() {
        const hsl = this.hsl;
        hsl.l += 5;
        return new Color(hsl);
    }

    getDarkerColor() {
        const hsl = this.hsl;
        hsl.l -= 5;
        return new Color(hsl);
    }

    getSaturatedColor() {
        const hsl = this.hsl;
        hsl.s += 5;
        return new Color(hsl);
    }

    getDesaturatedColor() {
        const hsl = this.hsl;
        hsl.s -= 5;
        return new Color(hsl);
    }

    setLuminance(luminance) {
        const hsl = this.hsl;
        hsl.l = luminance;
        this.set(hsl);
    }


}
