import type { ThemeColors } from "./types";
import { parseCssColor } from "@unocss/preset-mini/utils";

export function rgb2hsl(values: (string | number) []) {
  const [r, g, b] = values.map(e => Number(e) / 255);
  // convert values to percentage
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  // default hsl to achromatic
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  // if not achromatic...
  if (max !== min) {
    s = (max - l) / Math.min(l, 1 - l);

    switch (max) {
      case r:
        h = 60 * (g - b) / d;
        break;
      case g:
        h = 60 * ((b - r) / d + 2);
        break;
      case b:
        h = 60 * ((r - g) / d + 4);
        break;
    }
    if (h < 0) {
      h += 360;
    }
  }
  return [h, s, l];
}

function getCssColor(color: string | (string | number) [], colorFormat: "rgb" | "hsl") {
  if (Array.isArray(color)) {
    return color.join(" ");
  }
  const cssColor = parseCssColor(color);
  if (cssColor) {
    const components = [...cssColor.components];
    if (cssColor.alpha) {
      components.push(cssColor.alpha);
      return components.join(",");
    }
    if (colorFormat === "hsl") {
      const [hue, sat, light] = rgb2hsl(components);
      components[0] = hue;
      components[1] = `${sat * 100}%`;
      components[2] = `${light * 100}%`;
    }
    return components.join(" ");
  }
  return color;
}

/**
 * 将主题颜色对象转换为指定格式的颜色组件
 *
 * @param colors - 主题颜色对象，包含不同主题下的颜色值
 * @param defaultTheme - 默认主题名称，用于处理未指定主题的颜色值
 * @param colorFormat - 颜色格式，支持 "rgb" 或 "hsl"
 * @returns 返回一个对象，包含按主题和颜色名称分类的颜色组件
 */
export function getColorComponents(colors: ThemeColors = {}, defaultTheme: string, colorFormat: "rgb" | "hsl") {
  const rs: Record<string, Record<string, | string>> = {};
  for (const key in colors) {
    const value = colors[key];

    if (typeof value === "string" || Array.isArray(value)) {
      if (!rs[defaultTheme]) {
        rs[defaultTheme] = {};
      }
      rs[defaultTheme][key] = getCssColor(value, colorFormat);
    } else {
      for (const colorName in value) {
        if (!rs[colorName]) {
          rs[colorName] = {};
        }
        rs[colorName][key] = getCssColor(value[colorName], colorFormat);
      }
    }
  }
  return rs;
}

export function normalizeVarName(varName: string) {
  return `--${varName}`.replace(/^-+/, "--");
}
