import {Color} from './lib/color.js';

function addThemeListner(event=undefined) {

    const colorPicker = document.querySelector('.color-picker');
    const baseColor = new Color(colorPicker?.value || '#e66465');

    // Calculate the relative luminance of the base color
    const luminance = baseColor.getRelativeLuminance();

    // Define the light and dark colors based on the relative luminance
    const lightColor = new Color(baseColor.rgb).setLuminance(Math.max(luminance + 0.5, 1));
    const lightContrastColor = lightColor.getBestContrastColor();
    const darkColor = new Color(baseColor.rgb).setLuminance(Math.min(luminance - 0.3,0));
    const darkContrastColor = darkColor.getBestContrastColor();

    console.log(baseColor.toString(), lightColor.toString(), darkColor.toString())

    const getAutoColor = (color) => {
        const luminance = color.getLuminance();
        return luminance > 0.5 ? darkColor : lightColor;
    };


    const lightTheme = {
        "--background-color": lightColor.toHexString(),
        "--text-color": lightContrastColor.toHexString(),
        "--input-background-color": lightContrastColor.lighten(5).toHexString(),
        "--input-border-color": lightContrastColor.darken(10).toHexString(),
        "--input-box-shadow-color": lightContrastColor.darken(10).toHexString(),
        "--color-wheel-border-color": lightContrastColor.lighten(20).toHexString(),
        "--color-picker-selector-color": lightContrastColor.invert().toHexString(),
        "--color-picker-selector-box-shadow-color": lightContrastColor.darken(10).toHexString(),
      };
      

    const darkTheme = {
        "--background-color": darkColor.toHexString(),
        "--text-color": darkContrastColor.toHexString(),
        "--input-background-color": darkContrastColor.darken(20).toHexString(),
        "--input-border-color": darkContrastColor.lighten(10).toHexString(),
        "--input-box-shadow-color": darkContrastColor.lighten(10).toHexString(),
        "--color-wheel-border-color": darkContrastColor.darken(10).toHexString(),
        "--color-picker-selector-color": darkContrastColor.invert().toHexString(),
        "--color-picker-selector-box-shadow-color": darkContrastColor.darken(10).toHexString(),
    };

    const autoTheme = {
        "--background-color": baseColor.lighten(90).toHexString(),
        "--text-color": baseColor.invert().toHexString(),
        "--input-background-color": baseColor.lighten(5).toHexString(),
        "--input-border-color": baseColor.darken(10).toHexString(),
        "--input-box-shadow-color": baseColor.darken(10).toHexString(),
        "--color-wheel-border-color": baseColor.lighten(20).toHexString(),
        "--color-picker-selector-color": baseColor.invert().toHexString(),
        "--color-picker-selector-box-shadow-color": baseColor.darken(10).toHexString(),
    };

    const toggleSwitch = document.querySelectorAll(".theme-switch input[type='radio']");
    const currentTheme = localStorage.getItem("theme") || 'dark';

    if (currentTheme) {
        document.documentElement.setAttribute("data-theme", currentTheme);
        if (currentTheme === "dark") {
            applyTheme(darkTheme);
            toggleSwitch[0].checked = true;
        } else if (currentTheme === "auto") {
            applyAutoTheme();
            toggleSwitch[1].checked = true;
        } else {
            applyTheme(lightTheme);
            toggleSwitch[2].checked = true;
        }
    }

    function applyTheme(theme) {
        Object.keys(theme).forEach((key) => {
            document.documentElement.style.setProperty(key, theme[key]);
            document.documentElement.style.setProperty(key, theme[key]);
        });
    }

    function applyAutoTheme() {
        if (baseColor.isDark()) {
            applyTheme(darkTheme);
            toggleSwitch[0].checked = true;
            localStorage.setItem("theme", "dark");
        } else {
            applyTheme(autoTheme);
            toggleSwitch[1].checked = true;
            localStorage.setItem("theme", "auto");
        }
    }

    toggleSwitch.forEach((radio) => {
        radio.addEventListener("change", (e) => {
            if (e.target.value === "dark") {
                applyTheme(darkTheme);
                localStorage.setItem("theme", "dark");
            } else if (e.target.value === "auto") {
                applyAutoTheme();
                localStorage.setItem("theme", "auto");
            } else {
                applyTheme(lightTheme);
                localStorage.setItem("theme", "light");
            }
        });
    });

}

(function setup() {
    window.onload = () => {
        addThemeListner();
        document.querySelector('.color-picker')?.addEventListener('input', addThemeListner)
    }
})()
