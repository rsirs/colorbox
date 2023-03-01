import {Color} from './lib/color.js';

function addThemeListner(event=undefined) {

    const colorPicker = document.querySelector('.color-input');
    const baseColor = new Color(colorPicker?.value || '#0091ea');

    // Calculate the relative luminance of the base color
    const luminance = baseColor.getRelativeLuminance();

    // Define the light and dark colors based on the relative luminance
    const lightColor = new Color().setLuminance(luminance + 0.5);
    const darkColor = new Color().setLuminance(luminance - 0.3);

    console.log(baseColor.toString(), lightColor.toString(), darkColor.toString())

    const getAutoColor = (color) => {
        const luminance = color.getLuminance();
        return luminance > 0.5 ? darkColor : lightColor;
    };


    const lightTheme = {
        "--background-color": lightColor.toHexString(),
        "--text-color": baseColor.invert().toHexString(),
        "--input-background-color": baseColor.lighten(20).toHexString(),
        "--input-border-color": baseColor.darken(20).toHexString(),
        "--input-box-shadow-color": baseColor.darken(20).toHexString(),
        "--color-wheel-border-color": baseColor.lighten(30).toHexString(),
        "--color-picker-selector-color": lightColor.toHexString(),
        "--color-picker-selector-box-shadow-color": baseColor.darken(20).toHexString(),
    };

    const darkTheme = {
        "--background-color": darkColor.toHexString(),
        "--text-color": baseColor.invert().toHexString(),
        "--input-background-color": baseColor.darken(20).toHexString(),
        "--input-border-color": baseColor.lighten(20).toHexString(),
        "--input-box-shadow-color": baseColor.lighten(20).toHexString(),
        "--color-wheel-border-color": baseColor.darken(30).toHexString(),
        "--color-picker-selector-color": darkColor.toHexString(),
        "--color-picker-selector-box-shadow-color": baseColor.lighten(20).toHexString(),
    };

    const autoTheme = {
        "--background-color": getAutoColor(baseColor).toHexString(),
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
    window.onload(() => {
        addThemeListner();
        document.querySelector('.color-input')?.addEventListener('input', addThemeListner)
    })
})()
