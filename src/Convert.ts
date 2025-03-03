// chromaticity-color-utilities
// Copyright (C) 2021 Emma Litwa-Vulcu
// 
// This program is free software: you can ristribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import * as Colors from './Colors'
import Util from './Util'
import { cieE, cieK, colorSpaces, xyzWavelengths } from './Reference'

class Convert {
  /////////// NORMALIZE & GAMMA ///////////

  /**
   * Normalize RGB values to 0-1
   * 
   * @param  {Colors.rgb} rgb
   * @return {Colors.rgbNormalized}
   */
  static rgbNormalize(rgb: Colors.rgb) : Colors.rgbNormalized {
    return new Colors.rgbNormalized(
      rgb.r / rgb.max,
      rgb.g / rgb.max,
      rgb.b / rgb.max,
      rgb.a / rgb.max
    )
  }

  /**
   * Apply gamma to normalized RGB value
   * NOT to be used with sRGB, L*, or other color spaces that utilize companding transformation formulae
   * 
   * @param  {Colors.rgbNormalized} rgb
   * @param  {number}               gamma
   * @return {Colors.rgbNormalized}
   */
  static applyGamma(rgb: Colors.rgbNormalized, gamma: number|string) : Colors.rgbNormalized {
    let gammaN
    if (typeof gamma === 'number') {
      gammaN = gamma
    }
    else if (typeof colorSpaces[gamma as keyof object]['gamma'] === 'number') {
      gammaN = colorSpaces[gamma as keyof object]['gamma']
    }
    else {
      throw new Error('Gamma not found for specificed color space')
    }
    let r = Math.pow(rgb.r, gammaN)
    let g = Math.pow(rgb.g, gammaN)
    let b = Math.pow(rgb.b, gammaN)

    return new Colors.rgbNormalized(r, g, b, rgb.a, gammaN)
  }

  /////////// HUE, SATURATION, VALUE/LIGHTNESS/BRIGHTNESS ///////////  

  /**
   * Convert RGB to HSV
   * Saturation and Value are in percentages
   *
   * @param  {Colors.rgb} rgb
   * @param  {boolean}    [round=true]
   * @return {Colors.hsv}
   */
  static rgb2hsv(rgb: Colors.rgb, round: boolean = true): Colors.hsv {
    let r = rgb.r / rgb.max;
    let g = rgb.g / rgb.max;
    let b = rgb.b / rgb.max;

    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let range = max - min;

    let val = max / 1 * 100;
    let sat = max ? range / max * 100 : 0;

    let hue;
    if      (!range)   hue = 0;
    else if (r == max) hue = (g - b) / range;
    else if (g == max) hue = (b - r)  / range + 2;
    else if (b == max) hue = (r - g)  / range + 4;
    else               hue = 0;

    hue *= 60;
    while (hue >= 360) hue -= 360;
    while (hue < 0) hue += 360;

    let a = Util.scaleValueRange(rgb.a, 0, rgb.max, 0, 100)

    if (round) {
      hue = Math.round(hue);
      sat = Math.round(sat);
      val = Math.round(val);
      a = Math.round(a)
    }

    return new Colors.hsv(hue, sat, val, a)
  }

  /**
   * Convert RGB to HSL
   * Saturation and Lightness are in percentages
   *
   * @param  {Colors.rgb} rgb
   * @param  {boolean}    [round=true]
   * @return {Colors.hsl}
   */
  static rgb2hsl(rgb: Colors.rgb, round: boolean = true): Colors.hsl {
    let r = rgb.r / rgb.max;
    let g = rgb.g / rgb.max;
    let b = rgb.b / rgb.max;

    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let chroma = max - min;

    let lit = (max + min) / 2;
    let sat = (lit == 0 || lit == 1 ? 0 : (max - lit) / Math.min(lit, 1 - lit)) * 100;
    lit *= 100;

    let hue;
    if      (!chroma)  hue = 0;
    else if (max == r) hue = (g - b) / chroma;
    else if (max == g) hue = (b - r) / chroma + 2;
    else if (max == b) hue = (r - g) / chroma + 4;
    else               hue = 0;
    hue *= 60;
    while (hue >= 360) hue -= 360;
    while (hue < 0) hue += 360;

    let a = Util.scaleValueRange(rgb.a, 0, rgb.max, 0, 100)

    if (round) {
      hue = Math.round(hue);
      sat = Math.round(sat);
      lit = Math.round(lit);
      a = Math.round(a);
    }

    return new Colors.hsl(hue, sat, lit, a)
  }

  /**
   * Convert RGB to HSI
   * Saturation and Intensity are in percentages
   *
   * @param  {Colors.rgb} rgb
   * @param  {boolean}    [round=true]
   * @return {Colors.hsi}
   */
  static rgb2hsi(rgb: Colors.rgb, round: boolean = true): Colors.hsi {
    let r = rgb.r / rgb.max;
    let g = rgb.g / rgb.max;
    let b = rgb.b / rgb.max;

    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);

    let chroma = max - min;

    let int = (r + g + b) * (1 / 3);

    let hue;
    let sat;
    if (!chroma) {
      hue = 0;
      sat = 0;
    }
    else {
      if      (max == r) hue = Util.fmod((g - b) / chroma, 6);
      else if (max == g) hue = ((b- r)  / chroma) + 2;
      else               hue = ((r - g) / chroma) + 4;
      hue *= 60;
      while (hue >= 360) hue -= 360;
      while (hue < 0) hue += 360;

      sat = chroma && int ? (1 - min / int) * 100 : 0;
    }
    int *= 100;

    let a = Util.scaleValueRange(rgb.a, 0, rgb.max, 0, 100)

    if (round) {
      hue = Math.round(hue);
      sat = Math.round(sat);
      int = Math.round(int);
      a = Math.round(a)
    }

    return new Colors.hsi(hue, sat, int, a)
  }

  /**
   * Convert HSV to RGB
   * Saturation and Value should be in percentages
   *
   * @param  {Colors.hsv} hsv
   * @param  {boolean}    [round=true]
   * @param  {number}     [bitDepth=8]
   * @return {Colors.rgb}
   */
  static hsv2rgb(hsv: Colors.hsv, round: boolean = true, bitDepth: number = 8): Colors.rgb {
    let r, g, b
    let max = (2 ** bitDepth) - 1
    if (hsv.s == 0) {
      let all = hsv.v
      r = all
      g = all
      b = all
    }
    else {
      let h = hsv.h / 60;
      let s = hsv.s / 100;
      let v = hsv.v / 100;
      let i = Math.floor(h);
      let f = h - i;
      let p = v * (1 - s);
      let q = v * (1 - s * f);
      let t = v * (1 - s * (1 - f));
      switch (i) {
        case 0:
          r = v;
          g = t;
          b = p;
          break;
        case 1:
          r = q;
          g = v;
          b = p;
          break;
        case 2:
          r = p;
          g = v;
          b = t;
          break;
        case 3:
          r = p;
          g = q;
          b = v;
          break;
        case 4:
          r = t;
          g = p;
          b = v;
          break;
        default:
          r = v;
          g = p;
          b = q;
      }
    }

    r = Math.min(Math.max(r,0),1)
    g = Math.min(Math.max(g,0),1)
    b = Math.min(Math.max(b,0),1)

    r *= max
    g *= max
    b *= max

    let a = Util.scaleValueRange(hsv.a, 0, 100, 0, max, round)

    if (round) {
      r = Math.round(r);
      g = Math.round(g);
      b = Math.round(b);
      a = Math.round(a);
    }

    return new Colors.rgb(r, g, b, a, bitDepth)
  }

  /**
   * Convert HSV to HSL
   * Saturation and Value should be in percentages
   * Saturation and Lightness are in percentages
   *
   * @param  {Colors.hsv} hsv
   * @param  {boolean}    [round=true]
   * @return {Colors.hsl}
   */
  static hsv2hsl(hsv: Colors.hsv, round: boolean = true): Colors.hsl {
    let s = hsv.s / 100;
    let v = hsv.v / 100;

    let lit = v * (1 - (s / 2));

    let sat;
    if (lit == 0 || lit == 1) {
      sat = 0;
    }
    else {
      sat = (v - lit) / (Math.min(lit, 1 - lit));
    }

    lit *= 100;
    sat *= 100;

    if (round) {
      lit = Math.round(lit);
      sat = Math.round(sat);
    }

    return new Colors.hsl(hsv.h, sat, lit, hsv.a)
  }

  /**
   * Convert HSV to HSI
   * Saturation(V) and Value should be in percentages
   * Saturation(I) and Intensity will be in percentages
   *
   * @param  {Colors.hsv} hsv
   * @param  {boolean}    [round=true]
   * @return {Colors.hsi}
   */
  static hsv2hsi(hsv: Colors.hsv, round: boolean = true): Colors.hsi {
    let rgb = this.hsv2rgb(hsv, false);
    let hsi = this.rgb2hsi(rgb, round);
    return hsi;
  }

  /**
   * Convert HSL to HSV
   * Saturation and Lightness should be in percentages
   * Saturation and Value are in percentages
   *
   * @param  {Colors.hsl} hsl
   * @param  {boolean}    [round=true]
   * @return {Colors.hsv}
   */
  static hsl2hsv(hsl: Colors.hsl, round: boolean = true): Colors.hsv {
    let s = hsl.s / 100
    let l = hsl.l / 100

    let val = (l + s * Math.min(l, 1 - l));
    let sat = val ? (2 * (1 - l / val)) : 0;

    val *= 100
    sat *= 100

    if (round) {
      val = Math.round(val);
      sat = Math.round(sat);
    }

    return new Colors.hsv(hsl.h, sat, val, hsl.a)
  }

  /**
   * Convert HSL to RGB
   * Saturation and Lightness should be in percentages
   *
   * @param  {Colors.hsl} hsl
   * @param  {boolean}    [round=true]
   * @param  {number}     [bitDepth=8]
   * @return {Colors.rgb}
   */
  static hsl2rgb(hsl: Colors.hsl, round: boolean = true, bitDepth: number = 8): Colors.rgb {
    let h = hsl.h / 60
    let s = hsl.s / 100
    let l = hsl.l / 100
    let r;
    let g;
    let b;
    if (!s) {
      r = l;
      g = l;
      b = l;
    }
    else {
      let chroma = (1 - Math.abs(2 * l - 1)) * s;
      let huef = Math.floor(h);
      let x = chroma * (1 - Math.abs(Util.fmod(h, 2) - 1));
      let m = l - (chroma / 2);

      switch (huef) {
        case 0:
          r = chroma + m;
          g = x + m;
          b = m;
          break;
        case 1:
          r = x + m;
          g = chroma + m;
          b = m;
          break;
        case 2:
          r = m;
          g = chroma + m;
          b = x + m;
          break;
        case 3:
          r = m;
          g = x + m;
          b = chroma + m;
          break;
        case 4:
          r = x + m;
          g = m;
          b = chroma + m;
          break;
        case 5:
          r = chroma + m;
          g = m;
          b = x + m;
          break;
        default:
          r = m;
          g = m;
          b = m;
      }
    }

    r = Math.min(Math.max(r,0),1)
    g = Math.min(Math.max(g,0),1)
    b = Math.min(Math.max(b,0),1)

    let max = (2 ** bitDepth) - 1
    r *= max;
    g *= max;
    b *= max;

    
    let a = Util.scaleValueRange(hsl.a, 0, 100, 0, max, round)

    if (round) {
      r = Math.round(r);
      g = Math.round(g);
      b = Math.round(b);
      a = Math.round(a);
    }

    return new Colors.rgb(r, g, b, a, bitDepth)
  }

  /**
   * Convert HSL to HSI
   * Saturation(L) and Lightness should be in percentages
   * Saturation(I) and Intensity will be in percentages
   *
   * @param  {Colors.hsl} hsl
   * @param  {boolean}    [round=true]
   * @return {Colors.hsi}
   */
  static hsl2hsi(hsl: Colors.hsl, round: boolean = true): Colors.hsi {
    let rgb = this.hsl2rgb(hsl, false);
    let hsi = this.rgb2hsi(rgb, round);
    return hsi;
  }

  /**
   * Convert HSI to RGB
   * Saturation and Intensity should be in percentages
   *
   * @param  {Colors.hsi} hsi
   * @param  {boolean}    [round=true]
   * @param  {number}     [bitDepth=8]
   * @return {Colors.rgb}
   */
  static hsi2rgb(hsi: Colors.hsi, round: boolean = true, bitDepth: number = 8): Colors.rgb {
    let h = hsi.h / 60
    let s = hsi.s / 100
    let i = hsi.i / 100

    let m = i * (1 - s);

    let r;
    let g;
    let b;
    if (!s) {
      r = m;
      g = m;
      b = m;
    }
    else {
      let z = 1 - Math.abs(Util.fmod(h, 2) - 1);
      let chroma = (3 * i * s) / (1 + z);
      let x = chroma * z;
      let huef = Math.floor(h);
      switch (huef) {
        case 0:
          r = chroma + m;
          g = x + m;
          b = m;
          break;
        case 1:
          r = x + m;
          g = chroma + m;
          b = m;
          break;
        case 2:
          r = m;
          g = chroma + m;
          b = x + m;
          break;
        case 3:
          r = m;
          g = x + m;
          b = chroma + m;
          break;
        case 4:
          r = x + m;
          g = m;
          b = chroma + m;
          break;
        case 5:
          r = chroma + x;
          g = m;
          b = x + m;
          break;
        default:
          r = m;
          g = m;
          b = m;
      }
    }
    r = Math.min(Math.max(r,0),1)
    g = Math.min(Math.max(g,0),1)
    b = Math.min(Math.max(b,0),1)

    let max = (2 ** bitDepth) - 1
    r *= max
    g *= max
    b *= max

    let a = Util.scaleValueRange(hsi.a, 0, 100, 0, max, round)

    if (round) {
      r = Math.round(r);
      g = Math.round(g);
      b = Math.round(b);
      a = Math.round(a);
    }

    return new Colors.rgb(r, g, b, a, bitDepth)
  }

  /**
   * Convert HSI to HSV
   * Saturation(I) and Intensity should be in percentages
   * Saturation(V) and Value will be in percentages
   *
   * @param  {Colors.hsi} hsi
   * @param  {boolean}    [round=true]
   * @return {Colors.hsv}
   */
  static hsi2hsv(hsi: Colors.hsi, round: boolean = true): Colors.hsv {
    let rgb = this.hsi2rgb(hsi, false);
    let hsv = this.rgb2hsv(rgb, round);
    return hsv;
  }

  /**
   * Convert HSI to HSL
   * Saturation(I) and Intensity should be in percentages
   * Saturation(L) and Lightness will be in percentages
   *
   * @param  {Colors.hsi} hsi
   * @param  {boolean}    [round=true]
   * @return {Colors.hsl}
   */
  static hsi2hsl(hsi: Colors.hsi, round: boolean = true): Colors.hsl {
    let rgb = this.hsi2rgb(hsi, false);
    let hsl = this.rgb2hsl(rgb, round);
    return hsl;
  }

  static rgb2hsp(rgb: Colors.rgb, round: boolean = true, Pb: number = 0.114, Pr: number = 0.299) : Colors.hsp {
    if (Pr + Pb > 1) {
      throw new Error('Pr + Pg + Pb must = 1')
    }

    let Pg = 1 - Pr - Pb

    let maxVal = (2 ** rgb.bitDepth) - 1
    let r = rgb.r / maxVal
    let g = rgb.g / maxVal
    let b = rgb.b / maxVal
    
    let pb = Math.sqrt(Math.pow(r,2) * Pr + Math.pow(g,2) * Pg + Math.pow(b,2) * Pb)

    let value = Math.max(r,g,b)
    let chroma = value - Math.min(r,g,b)

    let s = value ? chroma / value : 0

    let h
    if      (!chroma)    h = 0
    else if (value == r) h = (g - b) / chroma
    else if (value == g) h = (b - r) / chroma + 2
    else if (value == b) h = (r - g) / chroma + 4
    else                 h = 0

    h  *= 60
    while (h >= 360) h -= 360
    while (h < 0) h += 360

    s  *= 100
    pb *= 100

    let a = Util.scaleValueRange(rgb.a, 0, maxVal, 0, 100, round)

    if (round) {
      h = Math.round(h)
      s = Math.round(s)
      pb = Math.round(pb)
      a = Math.round(a)
    }

    return new Colors.hsp(h, s, pb, a, Pb, Pr)
  }

  static hsp2rgb(hsp: Colors.hsp, round: boolean = true, bitDepth: number = 8) : Colors.rgb {
    let hp = hsp.h / 60
    let s =  hsp.s / 100
    let pb = hsp.p / 100

    let s0 = 1 - s

    let r, g, b

    let hpf = Math.floor(hp)
    let hpp
    if (s0 > 0) {
      switch (hpf) {
        case 0: //R>G>B
          hpp = hp
          b = pb / Math.sqrt(hsp.pr / Math.pow(s0, 2) + hsp.pg * Math.pow(1 + hpp + (1 / s0 - 1), 2) + hsp.pb)
          r = b / s0
          g = b + hpp * (r - b)
          break
        case 1: //G>R>B
          hpp = -1 * hp + 2
          b = pb / Math.sqrt(hsp.pg / Math.pow(s0, 2) + hsp.pr * Math.pow(1 + hpp * (1 / s0 - 1), 2) + hsp.pb)
          g = b / s0
          r = b + hpp * (g - b)
          break
        case 2: //G>B>R
          hpp = hp - 2
          r = pb / Math.sqrt(hsp.pg / Math.pow(s0, 2) + hsp.pb * Math.pow(1 + hpp * (1 / s0 - 1), 2) + hsp.pr)
          g = r / s0
          b = r + hpp * (g - r)
          break
        case 3: //B>G>R
          hpp = -1 * hp + 4
          r = pb / Math.sqrt(hsp.pb / Math.pow(s0, 2) + hsp.pr * Math.pow(1 + hpp * (1 / s0 - 1) ,2) + hsp.pr)
          b = r / s0
          g = r + hpp * (b - r)
          break
        case 4: //B>R>G
          hpp = hp - 4
          g = pb / Math.sqrt(hsp.pb / Math.pow(s0, 2) + hsp.pr * Math.pow(1 + hpp * (1 / s0 - 1), 2) + hsp.pg)
          b = g / s0
          r = g + hpp * (b - g)
          break
        case 5: //R>B>G
        default:
          hpp = -1 * hp + 6
          g = pb / Math.sqrt(hsp.pr / Math.pow(s0, 2) + hsp.pb * Math.pow(1 + hpp * (1 / s0 - 1), 2) + hsp.pg)
          r = g / s0
          b = g + hpp * (r - g)
      }
    }
    else {
      switch (hpf) {
        case 0: //R>G>B
          hpp = hp
          r = Math.sqrt(Math.pow(pb,2)/(hsp.pr + hsp.pg * Math.pow(hpp, 2)))
          g = r * hpp
          b = 0
          break
        case 1: //G>R>B
          hpp = -1 * hp + 2
          g = Math.sqrt(Math.pow(pb,2)/(hsp.pg + hsp.pr * Math.pow(hpp, 2)))
          r = g * hpp
          b = 0
          break
        case 2: //G>B>R
          hpp = hp - 2
          g = Math.sqrt(Math.pow(pb,2)/(hsp.pr + hsp.pg * Math.pow(hpp, 2)))
          b = g * hpp
          r = 0
          break
        case 3: //B>G>R
          hpp = -1 * hp + 4
          b = Math.sqrt(Math.pow(pb,2)/(hsp.pb + hsp.pg * Math.pow(hpp, 2)))
          g = b * hpp
          r = 0
          break
        case 4: //B>R>G
          hpp = hp - 4
          b = Math.sqrt(Math.pow(pb,2)/(hsp.pb + hsp.pr * Math.pow(hpp, 2)))
          r = b * hpp
          g = 0
          break
        case 5: //R>B>G
        default:
          hpp = -1 * hp + 6
          r = Math.sqrt(Math.pow(pb,2)/(hsp.pr + hsp.pb * Math.pow(hpp, 2)))
          b = r * hpp
          g = 0
      }
    }

    r = Math.min(Math.max(r,0),1)
    g = Math.min(Math.max(g,0),1)
    b = Math.min(Math.max(b,0),1)

    let max = (2 ** bitDepth) - 1
    r *= max
    g *= max
    b *= max

    let a = Util.scaleValueRange(hsp.a, 0, 100, 0, max, round)

    if (round) {
      r = Math.round(r)
      g = Math.round(g)
      b = Math.round(b)
      a = Math.round(a)
    }

    return new Colors.rgb(r,g,b,a,bitDepth)
  }

  /////////// CMYK ///////////

  /**
   * Convert RGB to CMYK
   * This conversion is mathematical and does not take pigment conversion into account
   *
   * @param  {Colors.rgb} rgb
   * @param  {boolean}    [round=true]
   * @param  {number}     [bitDepth=255] RGB max value per channel
   * @return {Colors.cmyk}
   */
  static rgb2cmyk(rgb: Colors.rgb, round: boolean = true): Colors.cmyk {
    let r = rgb.r / rgb.max;
    let g = rgb.g / rgb.max;
    let b = rgb.b / rgb.max;

    //todo: if alpha, blend value with white

    let c;
    let m;
    let y;
    let k = 1 - Math.max(r, g, b);
    if (k == 1) {
      c = 0;
      m = 0;
      y = 0;
    }
    else {
      c = (1 - r - k) / (1 - k) * 100;
      m = (1 - g - k) / (1 - k) * 100;
      y = (1 - b - k) / (1 - k) * 100;
    }
    k *= 100;

    if (round) {
      c = Math.round(c);
      m = Math.round(m);
      y = Math.round(y);
      k = Math.round(k);
    }

    return new Colors.cmyk(c,m,y,k)
  }

  /**
   * Convert CMYK to RGB
   * This conversion is mathematical and does not take pigment conversion into account
   *
   * @param  {Colors.cmyk} cmyk
   * @param  {boolean}     [round=true]
   * @param  {number}      [bitDepth=8]
   * @return {Colors.rgb}
   */
  static cmyk2rgb(cmyk: Colors.cmyk, round: boolean = true, bitDepth: number = 8): Colors.rgb {
    let c = cmyk.c / 100
    let m = cmyk.m / 100
    let y = cmyk.y / 100
    let k = cmyk.k / 100

    let max = ((2 ** bitDepth) - 1)

    let r = (1 - c) * (1 - k) * max;
    let g = (1 - m) * (1 - k) * max;
    let b = (1 - y) * (1 - k) * max;

    if (round) {
      r = Math.round(r);
      g = Math.round(g);
      b = Math.round(b);
    }

    return new Colors.rgb(r, g, b, max, bitDepth)
  }

  /////////// YIQ ///////////

  /**
   * Convert RGB to YIQ
   * TODO: Validate Algorithm
   *
   * @param  {Colors.rgb}   rgb
   * @param  {boolean}      [normalize=true] true = Y[0,255], I&Q[-128,128]; false = Y[0,1], I[-0.5957,0.5957], Q[-0.5226,0.5226]
   * @param  {boolean}      [round=true]     will not round if not normalized
   * @return {Colors.yiq}
   */
  static rgb2yiq(rgb: Colors.rgb, normalize: boolean = true, round: boolean = true): Colors.yiq {
    let r = rgb.r / rgb.max
    let g = rgb.g / rgb.max
    let b = rgb.b / rgb.max

    let y = 0.299  * r +  0.587  * g +  0.114  * b;
    let i = 0.5959 * r + -0.2746 * g + -0.3213 * b;
    let q = 0.2115 * r + -0.5227 * g +  0.3112 * b;

    y = Math.min(Math.max(y,0),1);
    i = Math.min(Math.max(i,-0.5957),0.5957);
    q = Math.min(Math.max(q,-0.5226),0.5226);

    if (normalize) {
      y = Util.scaleValueRange(y, 0, 1, 0, 255, false);
      i = Util.scaleValueRange(i + 0.5957, 0, 1.1914, 0, 256, false) - 128;
      q = Util.scaleValueRange(q + 0.5226, 0, 1.0452, 0, 256, false) - 128;

      if (round) {
        y = Math.round(y);
        i = Math.round(i);
        q = Math.round(q);
      }
    }

    return new Colors.yiq(y,i,q,normalize)
  }

  /**
   * Convert YIQ to RGB
   *
   * @param  {Colors.yiq} yiq
   * @param  {boolean}    [round=true]
   * @param  {number}     [bitDepth=8]
   * @return {Colors.rgb}
   */
  static yiq2rgb(yiq: Colors.yiq, round: boolean = true, bitDepth: number = 8): Colors.rgb {
    let y = yiq.y
    let i = yiq.i
    let q = yiq.q
    if (yiq.normalized) {
      y = Util.scaleValueRange(y, 0, 255, 0, 1, false);
      i = Util.scaleValueRange(i, -128, 128, -0.5957, 0.5957, false);
      q = Util.scaleValueRange(q, -128, 128, -0.5226, 0.5226, false);
    }

    let r = y +  0.956 * i +  0.621 * q;
    let g = y + -0.272 * i + -0.647 * q;
    let b = y + -1.106 * i +  1.703 * q;

    r = Math.min(Math.max(r,0),1)
    g = Math.min(Math.max(g,0),1)
    b = Math.min(Math.max(b,0),1)

    let max = (2 ** bitDepth) - 1
    r *= max
    g *= max
    b *= max

    if (round) {
      r = Math.round(r);
      g = Math.round(g);
      b = Math.round(b);
    }

    return new Colors.rgb(r, g, b, max, bitDepth)
  }

  /////////// XYZ, xyY ///////////

  /**
   * Convert RGB to XYZ
   * X, Y, and Z will be between 0 and the white point reference XYZ values
   *
   * @param  {Colors.rgb} rgb
   * @param  {string}     [colorSpace=srgb]    RGB color space (e.g. sRGB)
   * @param  {string}     [referenceWhite=d65] RGB reference white (e.g. D65)
   * @return {Colors.xyz}
   */
  static rgb2xyz(rgb: Colors.rgb, colorSpace: string = 'srgb', referenceWhite: string = 'd65'): Colors.xyz {
    let r = rgb.r / rgb.max
    let g = rgb.g / rgb.max
    let b = rgb.b / rgb.max

    let space = Util.validColorSpace(colorSpace)
    referenceWhite = referenceWhite.toLowerCase()
    if (typeof space['rgb2xyz' as keyof object] == 'undefined' ||
        typeof space['rgb2xyz' as keyof object][referenceWhite] == 'undefined') {
          throw new Error('Transformation matrix unavailable for this color space and reference white');
    }
    let m = space['rgb2xyz' as keyof object][referenceWhite]

    if (colorSpace == 'srgb') {
      // sRGB
      r = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
      g = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
      b = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
    }
    else if (colorSpace == 'ecirgb') {
      // L*
      r = r <= 0.08 ? 100 * (r / cieK) : Math.pow((r + 0.16) / 1.16, 3);
      g = g <= 0.08 ? 100 * (g / cieK) : Math.pow((g + 0.16) / 1.16, 3);
      b = b <= 0.08 ? 100 * (b / cieK) : Math.pow((b + 0.16) / 1.16, 3);
    }
    else {
      // Gamma
      if (typeof space['gamma' as keyof object] == 'undefined') {
        throw new Error('Gamma not defined for this color space');
      }
      let gamma = space['gamma' as keyof object]
      r = Math.pow(r, gamma);
      g = Math.pow(g, gamma);
      b = Math.pow(b, gamma);
    }

    // [X]           [R]
    // [Y] = [M 3x3]*[G]
    // [Z]           [B]
    let x = m[0][0] * r + m[0][1] * g + m[0][2] * b;
    let y = m[1][0] * r + m[1][1] * g + m[1][2] * b;
    let z = m[2][0] * r + m[2][1] * g + m[2][2] * b;

    x = Math.min(Math.max(x,0),1)
    y = Math.min(Math.max(y,0),1)
    z = Math.min(Math.max(z,0),1)

    return new Colors.xyz(x,y,z)
  }

  /**
   * Convert XYZ to RGB
   * RGB values that fall outsize representable values will be clamped
   *
   * @param  {Colors.xyz} xyz
   * @param  {boolean}    [round=true]
   * @param  {number}     [bitDepth=8]
   * @return {Colors.rgb}
   */
  static xyz2rgb(xyz: Colors.xyz, colorSpace: string = 'srgb', referenceWhite: string = 'd65', round: boolean = true, bitDepth: number = 8): Colors.rgb {

    let space = Util.validColorSpace(colorSpace)
    referenceWhite = referenceWhite.toLowerCase()
    if (typeof space['xyz2rgb' as keyof object] == 'undefined' ||
        typeof space['xyz2rgb' as keyof object][referenceWhite] == 'undefined') {
          throw new Error('Transformation matrix unavailable for this color space and reference white');
    }
    let m = space['xyz2rgb' as keyof object][referenceWhite]

    // [R]       [X]
    // [G] = [M]*[Y]  where [M] is [RGB to XYZ matrix]^-1
    // [B]       [Z]
    let r = m[0][0] * xyz.x + m[0][1] * xyz.y + m[0][2] * xyz.z;
    let g = m[1][0] * xyz.x + m[1][1] * xyz.y + m[1][2] * xyz.z;
    let b = m[2][0] * xyz.x + m[2][1] * xyz.y + m[2][2] * xyz.z;

    if (colorSpace == 'srgb') {
      // sRGB
      r = r <= 0.0031308 ? r * 12.92 : Math.pow((r * 1.055), 1/2.4) - 0.055;
      g = g <= 0.0031308 ? g * 12.92 : Math.pow((g * 1.055), 1/2.4) - 0.055;
      b = b <= 0.0031308 ? b * 12.92 : Math.pow((b * 1.055), 1/2.4) - 0.055;
    }
    else if (colorSpace == 'ecirgb') {
      // L*
      r = r <= cieE ? (r * cieK) / 100 : 1.16 * Math.pow(r, 1/3) - 0.16;
      r = g <= cieE ? (g * cieK) / 100 : 1.16 * Math.pow(g, 1/3) - 0.16;
      r = b <= cieE ? (b * cieK) / 100 : 1.16 * Math.pow(b, 1/3) - 0.16;
    }
    else {
      // Gamma
      if (typeof space['gamma' as keyof object] == 'undefined') {
        throw new Error('Gamma not defined for this color space');
      }
      r = Math.pow(r, 1 / space['gamma' as keyof object]);
      g = Math.pow(g, 1 / space['gamma' as keyof object]);
      b = Math.pow(b, 1 / space['gamma' as keyof object]);
    }

    let max = (2 ** bitDepth) - 1
    r = Math.min(Math.max(r,0),1) * max;
    g = Math.min(Math.max(g,0),1) * max;
    b = Math.min(Math.max(b,0),1) * max;

    if (round) {
      r = Math.round(r);
      g = Math.round(g);
      b = Math.round(b);
    }

    return new Colors.rgb(r, g, b, max, bitDepth)
  }

  /**
   * Convert XYZ to xyY
   * If X = Z = Y = 0, set x and y to chromaticity coordinates of reference white
   *
   * @param  {Colors.xyz} xyz
   * @return {Colors.xyy}
   */
  static xyz2xyy(xyz: Colors.xyz, referenceWhite: string = 'd65'): Colors.xyy {
    let w = Util.validReferenceWhite(referenceWhite)
    let cx;
    let cy;
    let sum = xyz.x + xyz.y + xyz.z;
    if (!sum) {
      cx = w.x;
      cy = w.y;
    }
    else {
      cx = xyz.x / sum;
      cy = xyz.y / sum;
    }

    return new Colors.xyy(cx, cy, xyz.y)
  }

  /**
   * Convert xyY to XYZ
   *
   * @param  {Colors.xyy} xyy
   * @return {Colors.xyz}
   */
  static xyy2xyz(xyy: Colors.xyy): Colors.xyz {
    let cx, cz
    if (xyy.y) {
      cx = 0;
      cz = 0;
    }
    else {
      cx = (xyy.x * xyy.yy) / xyy.y;
      cz = ((1 - xyy.x - xyy.y) * xyy.yy) / xyy.y;
    }

    return new Colors.xyz(cx, xyy.y, cz)
  }

  /////////// Lab ///////////

  /**
   * Convert XYZ to Lab
   *
   * @param  {Colors.xyz} xyz
   * @param  {string}     referenceWhite
   * @param  {boolean}    [round=true]
   * @return {Colors.lab}
   */
  static xyz2lab(xyz: Colors.xyz, referenceWhite: string = 'd65', round: boolean = true): Colors.lab {
    let w = Util.validReferenceWhite(referenceWhite);

    let xr = xyz.x / w.x;
    let yr = xyz.y / w.y;
    let zr = xyz.z / w.z;

    let fx = xyz.x > cieE ? Math.pow(xr, 1/3) : (cieK * xr + 16) / 116;
    let fy = xyz.y > cieE ? Math.pow(yr, 1/3) : (cieK * yr + 16) / 116;
    let fz = xyz.z > cieE ? Math.pow(zr, 1/3) : (cieK * zr + 16) / 116;

    let l = 116 * fy - 16;
    let a = 500 * (fx - fy);
    let b = 200 * (fy - fz);

    l = Math.min(Math.max(l,0),100)

    if (round) {
      l = Math.round(l)
      a = Math.round(a)
      b = Math.round(b)
    }

    return new Colors.lab(l, a, b)
  }

  /**
   * Convert Lab to XYZ
   *
   * @param  {Colors.lab} lab
   * @return {Colors.xyz}
   */
  static lab2xyz(lab: Colors.lab, referenceWhite: string = 'd65'): Colors.xyz {
    let w = Util.validReferenceWhite(referenceWhite);

    let fy = (lab.l + 16) / 116;
    let fx = lab.a / 500 + fy;
    let fz = fy - lab.b / 200;

    let xr = Math.pow(fx, 3) > cieE ? Math.pow(fx, 3) : (116 * fx - 16) / cieK;
    let yr = lab.l > cieK * cieE ? Math.pow(fy, 3) : lab.l * cieK;
    let zr = Math.pow(fz, 3) > cieE ? Math.pow(fz, 3) : (116 * fz - 16) / cieK;

    let x = xr * w.x;
    let y = yr * w.y;
    let z = zr * w.z;

    return new Colors.xyz(x, y, z)
  }

  /////////// Luv ///////////

  /**
   * Convert XYZ to Luv
   * L will range between 0% and 100%
   * u and v will range between -100% and 100%
   *
   * @param  {Colors.xyz} xyz
   * @return {Colors.luv}
   */
  static xyz2luv(xyz: Colors.xyz, referenceWhite: string = 'd65', round: boolean = true): Colors.luv {
    let w = Util.validReferenceWhite(referenceWhite);

    let yr = xyz.y / w.y;

    let div = xyz.x + 15 * xyz.y + 3 * xyz.z;
    let up, vp
    if (!div) {
      up = 0;
      vp = 0;
    }
    else {
      up = (4 * xyz.x) / div;
      vp = (9 * xyz.y) / div;
    }

    let upr = (4 * w.x) / (w.x + 15 * w.y + 3 * w.z);
    let vpr = (9 * w.y) / (w.x + 15 * w.y + 3 * w.z);

    let l = yr > cieE ? 116 * Math.pow(yr, 1/3) - 16 : cieK * yr;
    let u = 13 * l * (up - upr);
    let v = 13 * l * (vp - vpr);

    l = Math.min(Math.max(l,0),100)

    if (round) {
      l = Math.round(l)
      u = Math.round(u)
      v = Math.round(v)
    }

    return new Colors.luv(l, u, v)
  }

  /**
   * Convert Luv to XYZ
   * X, Y, and Z will be in range 0 to 1
   *
   * @param  {Colors.luv} luv
   * @return {Colors.xyz}
   */
  static luv2xyz(luv: Colors.luv, referenceWhite: string = 'd65'): Colors.xyz {
    let w = Util.validReferenceWhite(referenceWhite);

    let u0 = (4 * w.x) / (w.x + 15 * w.y + 3 * w.z);
    let v0 = (9 * w.y) / (w.x + 15 * w.y + 3 * w.z);

    let y = luv.l > cieK * cieE ? Math.pow((luv.l + 16) / 116, 3) : luv.l / cieK;

    let a = 1 / 3 * (((52 * luv.l) / (luv.u + 13 * luv.l * u0)) - 1);
    let b = -5 * y;
    let c = -1 / 3;
    let d = y * (((39 * luv.l) / (luv.v + 13 * luv.l * v0)) - 5);

    let x = (d - b) / (a - c);
    let z = x * a + b;

    return new Colors.xyz(x, y, z)
  }

  /////////// YCbCr and STANDARDS ///////////

  /**
   * Convert RGB to Rec709 RGB
   * Will output either 8-bit or 10-bit depending on input color space
   *
   * @param  {Colors.rgb}   rgb
   * @param  {boolean}      [round=true]
   * @param  {number}       [bitRate=8]
   * @return {Colors.rec709rgb}
   */
  static rgb2rec709rgb(rgb: Colors.rgb, round: boolean = true, bitRate: number = 8): Colors.rec709rgb {
    // output must be 8-bit or 10-bit, pick whichever is closer to input depth
    let rgbLower, rgbUpper
    if (bitRate == 8) {
      rgbLower = 16
      rgbUpper = 235
    }
    else if (bitRate == 10) {
      rgbLower = 64
      rgbUpper = 940
    }
    else {
      throw new Error('Invalid bitrate for Rec709, must be 8 or 10')
    }

    let r = Util.scaleValueRange(rgb.r, 0, rgb.max, rgbLower, rgbUpper, round);
    let g = Util.scaleValueRange(rgb.g, 0, rgb.max, rgbLower, rgbUpper, round);
    let b = Util.scaleValueRange(rgb.b, 0, rgb.max, rgbLower, rgbUpper, round);
    let a = Util.scaleValueRange(rgb.a, 0, rgb.max, 0, (2 ** bitRate) - 1, round);

    return new Colors.rec709rgb(r, g, b, a, bitRate)
  }

  /**
   * Convert Rec709 RGB to RGB
   * Converts 8-bit or 10-bit Rec709 RGB values to standard (0 - $color_depth) range
   * Input RGB values outside of legal black and white points will be clamped
   *
   * @param  {Colors.rec709rgb} rgb709
   * @param  {boolean}          [round=true]
   * @param  {number}           [bitDepth=8]
   * @return {Colors.rgb}
   */
  static rec709rgb2rgb(rgb709: Colors.rec709rgb, round: boolean = true, bitDepth: number = 8): Colors.rgb {
    let minFrom, maxFrom
    if (rgb709.bitDepth == 8) {
      minFrom = 16;
      maxFrom = 235;
    }
    else if (rgb709.bitDepth == 10) {
      minFrom = 64;
      maxFrom = 940;
    }
    else {
      throw new Error('Invalid bitrate (must be 8 or 10)');
    }

    // Rather than require bounds, clamp values
    let r709 = Math.min(Math.max(rgb709.r, minFrom), maxFrom);
    let g709 = Math.min(Math.max(rgb709.g, minFrom), maxFrom);
    let b709 = Math.min(Math.max(rgb709.b, minFrom), maxFrom);
    let a709 = Math.min(Math.max(rgb709.a, minFrom), maxFrom);

    let max = ((2 ** bitDepth) - 1)
    let r = Util.scaleValueRange(r709, minFrom, maxFrom, 0, max, round);
    let g = Util.scaleValueRange(g709, minFrom, maxFrom, 0, max, round);
    let b = Util.scaleValueRange(b709, minFrom, maxFrom, 0, max, round);
    let a = Util.scaleValueRange(a709, 0, rgb709.max, 0, max, round);

    return new Colors.rgb(r, g, b, a, bitDepth)
  }

  /**
   * Convert RGB to Rec2020 RGB
   * Will output either 10-bit or 12-bit depending on input color space
   *
   * @param  {Colors.rgb}   rgb
   * @param  {boolean}      [round=true]
   * @param  {number}       [bitRate=10]
   * @return {Colors.rec2020rgb}
   */
  static rgb2rec2020rgb(rgb: Colors.rgb, round: boolean = true, bitRate: number = 10): Colors.rec2020rgb {
    // output must be 10-bit or 12-bit, pick whichever is closer to input depth
    let rgbLower, rgbUpper
    if (bitRate == 10) {
      rgbLower = 64;
      rgbUpper = 940;
    }
    else if (bitRate == 12) {
      rgbLower = 256;
      rgbUpper = 3760;
    }
    else {
      throw new Error('Invalid bitrate for Rec2020, must be 10 or 12')
    }

    let r = Util.scaleValueRange(rgb.r, 0, rgb.max, rgbLower, rgbUpper, round);
    let g = Util.scaleValueRange(rgb.g, 0, rgb.max, rgbLower, rgbUpper, round);
    let b = Util.scaleValueRange(rgb.b, 0, rgb.max, rgbLower, rgbUpper, round);
    let a = Util.scaleValueRange(rgb.a, 0, rgb.max, 0, (2 ** bitRate) - 1, round);

    return new Colors.rec2020rgb(r, g, b, a, bitRate)
  }

  /**
   * Convert Rec2020 RGB to RGB
   * Converts 10-bit or 12-bit Rec2020 RGB values to standard (0 - $color_depth) range
   * Input RGB values outside of legal black and white points will be clamped
   *
   * @param  {Colors.rec2020rgb} rgb2020
   * @param  {boolean}           [round=true]
   * @param  {number}            [bitDepth=8]
   * @return {Colors.rgb}
   */
  static rec2020rgb2rgb(rgb2020: Colors.rec2020rgb, round: boolean = true, bitDepth: number = 8): Colors.rgb {
    let minFrom, maxFrom
    if (rgb2020.bitDepth == 10) {
      minFrom = 64;
      maxFrom = 876;
    }
    else if (rgb2020.bitDepth == 12) {
      minFrom = 256;
      maxFrom = 3760;
    }
    else {
      throw new Error('Invalid bitrate (must be 10 or 12)');
    }

    // Rather than require bounds, clamp values
    let r2020 = Math.min(Math.max(rgb2020.r, minFrom), maxFrom);
    let g2020 = Math.min(Math.max(rgb2020.g, minFrom), maxFrom);
    let b2020 = Math.min(Math.max(rgb2020.b, minFrom), maxFrom);
    let a2020 = Math.min(Math.max(rgb2020.a, minFrom), maxFrom);

    let max = (2 ** bitDepth) - 1
    let r = Util.scaleValueRange(r2020, minFrom, maxFrom, 0, max, round);
    let g = Util.scaleValueRange(g2020, minFrom, maxFrom, 0, max, round);
    let b = Util.scaleValueRange(b2020, minFrom, maxFrom, 0, max, round);
    let a = Util.scaleValueRange(a2020, 0, rgb2020.max, 0, max, round);

    return new Colors.rgb(r, g, b, a, bitDepth)
  }
  /**
   * Convert RGB to YCbCr
   *
   * @param  {Colors.rgb}   rgb
   * @param  {number}       kb   Kb constant defined from target color space, such that Kb + Kr + Kg = 1
   * @param  {number}       kr   Kr constant defined from target color space, such that Kb + Kr + Kg = 1
   * @param  {boolean}      [round=true]
   * @return {Colors.ycbcr}
   */
  static rgb2ycbcr(rgb: Colors.rgb, kb: number, kr: number, round: boolean = true): Colors.ycbcr {
    let yppbpr = this.rgb2ypbpr(rgb, kb, kr);
    let ycbcr = this.ypbpr2ycbcr(yppbpr, 0, rgb.max, 0, rgb.max, round);

    return ycbcr;
  }

  /**
   * Convert RGB to YPbPr
   * Y will range from 0 to 1; Pb and Pr will range from -0.5 to 0.5
   *
   * @param  {Colors.rgb} rgb
   * @param  {number}     kb   Kb constant defined from target color space, such that Kb + Kr + Kg = 1
   * @param  {number}     kr   Kr constant defined from target color space, such that Kb + Kr + Kg = 1
   * @return {Colors.ypbpr}
   */
  static rgb2ypbpr(rgb: Colors.rgb, kb: number, kr: number): Colors.ypbpr {
    let r = rgb.r / rgb.max
    let g = rgb.g / rgb.max
    let b = rgb.b / rgb.max

    let kg = 1 - kb - kr;

    // Y' ranges from 0 to 1
    let y = kr * r + kg * g + kb * b;

    // Pb and Pr range from -0.5 to +0.5
    // the following equations are equivalent
    let pb = 0.5 * ((b - y) / (1 - kb))
    let pr = 0.5 * ((r - y) / (1 - kr))
    // let pb = (-0.5 * (kr / (1 - kb))) * r + (-0.5 * (kg / (1 - kb))) * g + 0.5 * b;
    // let pr = 0.5 * r + (-0.5 * (kg / (1 - kr))) * g + (-0.5 * (kb / (1 - kr))) * b;

    return new Colors.ypbpr(y, pb, pr, kb, kr)
  }

  /**
   * Convert YPbPr to RGB
   * Y must range from 0 to 1; Pb and Pr must range from -0.5 to 0.5
   *
   * @param  {Colors.ypbpr} ypbpr
   * @param  {number}       kb             Kb constant defined from target color space, such that Kb + Kr + Kg = 1
   * @param  {number}       kr             Kr constant defined from target color space, such that Kb + Kr + Kg = 1
   * @param  {boolean}      [round=true]
   * @param  {number}       [bitDepth=8]
   * @return {Colors.rgb}
   */
  static ypbpr2rgb(ypbpr: Colors.ypbpr, kb: number, kr: number, round: boolean = true, bitDepth: number = 8): Colors.rgb {
    let kg = 1 - kb - kr;

    let r = ypbpr.y + (2 - 2 * kr) * ypbpr.pr;
    let g = ypbpr.y + (-1 * (kb / kg) * (2 - 2 * kb)) * ypbpr.pb + (-1 * (kr / kg) * (2 - 2 * kr)) * ypbpr.pr;
    let b = ypbpr.y + (2 - 2 * kb) * ypbpr.pb;

    let max = (2 ** bitDepth) - 1
    r *= max;
    g *= max;
    b *= max;

    // values may be very nearly slightly less than exactly 0 or 255 (:
    r = Math.min(Math.max(0,r),max)
    g = Math.min(Math.max(0,g),max)
    b = Math.min(Math.max(0,b),max)

    if (round) {
      r = Math.round(r);
      g = Math.round(g);
      b = Math.round(b);
    }

    return new Colors.rgb(r, g, b, max, bitDepth)
  }

  /**
   * Convert YPbPr to YCbCr
   * Y must be in range 0 to 1; Pb and Pr must be in range -0.5 to 0.5
   *  16 for black and the value of 235 for white when using an 8-bit representation. The standard has 8-bit digitized versions of CB and CR scaled to a different range of 16 to 240
   *
   * @param  {Colors.ypbpr} ypbpr
   * @param  {number}       [yLower=16]  Lower bounds of Y
   * @param  {number}       [yUpper=235] Upper bounds of Y
   * @param  {number}       [cLower=16]  Lower bounds of Cb and Cr
   * @param  {number}       [cUpper=240] Upper bounds of Cb and Cr
   * @param  {boolean}      [round=true]
   * @return {Colors.ycbcr}
   */
  static ypbpr2ycbcr(ypbpr: Colors.ypbpr, yLower: number = 16, yUpper: number = 135, cLower: number = 16, cUpper: number = 240, round: boolean = true): Colors.ycbcr {
    let y2 = Util.scaleValueRange(ypbpr.y, 0, 1, yLower, yUpper, round);
    let cb = Util.scaleValueRange(ypbpr.pb + 0.5, 0, 1, cLower, cUpper, round);
    let cr = Util.scaleValueRange(ypbpr.pr + 0.5, 0, 1, cLower, cUpper, round);

    return new Colors.ycbcr(y2, cb, cr)
  }

  /**
   * Convert YCbCr to YPbPr
   * Y will be in range 0 to 1; Pb and Pr will be in range -0.5 to 0.5
   *
   * @param  {Colors.ycbcr} ycbcr
   * @param  {number}       kb
   * @param  {number}       kr
   * @return {Colors.ypbpr}
   */
  static ycbcr2ypbpr(ycbcr: Colors.ycbcr, kb: number, kr: number): Colors.ypbpr {
    let y2 = Util.scaleValueRange(ycbcr.y, ycbcr.yLower, ycbcr.yUpper, 0, 1, false);
    let pb = Util.scaleValueRange(ycbcr.cb, ycbcr.cLower, ycbcr.cUpper, 0, 1, false) - 0.5;
    let pr = Util.scaleValueRange(ycbcr.cr, ycbcr.cLower, ycbcr.cUpper, 0, 1, false) - 0.5;

    return new Colors.ypbpr(y2, pb, pr, kb, kr)
  }

  /**
   * Convert RGB to JPEG YCbCr
   * Output Y, Cb, and Cr range from 0 to 255
   *
   * @param  {Colors.rgb}   rgb
   * @param  {boolean}      [round=true]
   * @return {Colors.ycbcr}
   */
  static rgb2jpegycbcr(rgb: Colors.rgb, round: boolean = false): Colors.ycbcr {
    let r = rgb.r
    let g = rgb.g
    let b = rgb.b
    if (rgb.max != 255) {
      r = r / rgb.max * 255;
      g = g / rgb.max * 255;
      b = b / rgb.max * 255;
    }

    let y = 0.299 * r + 0.587 * g + 0.114 * b;
    let cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
    let cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

    if (round) {
      y = Math.round(y);
      cb = Math.round(cb);
      cr = Math.round(cr);
    }

    return new Colors.ycbcr(y, cb, cr)
  }

  /**
   * Convert JPEG YCbCr to RGB
   * Y, Cb, and Cr should range from 0 to 255
   *
   * @param  {Colors.ycbcr} ycbcr
   * @param  {boolean}      [round=true]
   * @param  {number}       [bitDepth=8]
   * @return {Colors.rgb}
   */
  static jpegycbcr2rgb(ycbcr: Colors.ycbcr, round: boolean = true, bitDepth: number = 8): Colors.rgb {
    let r = ycbcr.y + 1.402 * (ycbcr.cr - 128);
    let g = ycbcr.y - 0.344136 * (ycbcr.cb - 128) - 0.714136 * (ycbcr.cr - 128);
    let b = ycbcr.y + 1.772 * (ycbcr.cb - 128);

    let max = (2 ** bitDepth) - 1
    if (bitDepth != 255) {
      r = r / 255 * max
      g = g / 255 * max
      b = b / 255 * max
    }

    if (round) {
      r = Math.round(r);
      g = Math.round(g);
      b = Math.round(b);
    }

    return new Colors.rgb(r, g, b, max, bitDepth)
  }
  
  /////////// ONE WAY APPROXIMATIONS to RGB ///////////

  /**
   * Convert a wavelength in nm to RGB
   * This is hugely perceptual and approximate
   *
   * @param  {Colors.nm}  nm            Wavelength of light in nanometers (positive number)
   * @param  {number}     [gamma=0.8]   Gamma adjustment
   * @param  {boolean}    [round=true]
   * @param  {number}     [bitDepth=8]
   * @return {Colors.rgb}
   */
  static nm2rgb(nm: Colors.nm, gamma: number = 0.8, round: boolean = true, bitDepth: number = 8): Colors.rgb {
    let r;
    let g;
    let b;

    if (nm.wavelength >= 380 && nm.wavelength < 440) {
      r = ((nm.wavelength - 440) / (440 - 380)) * -1;
      g = 0;
      b = 1;
    }
    else if (nm.wavelength >= 440 && nm.wavelength < 490) {
      r = 0;
      g = (nm.wavelength - 440) / (490 - 440);
      b = 1;
    }
    else if (nm.wavelength >= 510 && nm.wavelength < 580) {
      r = (nm.wavelength - 510) / (580 - 510);
      g = 1;
      b = 0;
    }
    else if (nm.wavelength >= 580 && nm.wavelength < 645) {
      r = 1;
      g = ((nm.wavelength - 645) / (645 - 580)) * -1;
      b = 0;
    }
    else if (nm.wavelength >= 645 && nm.wavelength < 781) {
      r = 1;
      g = 0;
      b = 0;
    }
    else {
      r = 0;
      g = 0;
      b = 0;
    }

    let factor;
    // Let the intensity fall off near the vision limits
    if (nm.wavelength >= 380 && nm.wavelength < 420) {
      factor = 0.3 + 0.7 * (nm.wavelength - 380) / (420 - 380);
    }
    else if (nm.wavelength >= 420 && nm.wavelength < 701) {
      factor = 1;
    }
    else if (nm.wavelength >= 701 && nm.wavelength < 781) {
      factor = 0.3 + 0.7 * (780 - nm.wavelength) / (780 - 700);
    }
    else {
      factor = 0;
    }

    let max = (2 ** bitDepth) - 1
    
    if (r > 0) {
      r = max * Math.pow(r * factor, gamma)
    }
    if (g > 0) {
      g = max * Math.pow(g * factor, gamma)
    }
    if (b > 0) {
      b = max * Math.pow(b * factor, gamma)
    }

    if (round) {
      r = Math.round(r);
      g = Math.round(g);
      b = Math.round(b);
    }

    return new Colors.rgb(r, g, b, max, bitDepth)
  }

  /**
   * Convert a color temperature in Kelvin to RGB
   * Adapted from 'RGB VALUES FOR HOT OBJECTS' by William T. Bridgman, NASA, 2000
   * http://www.physics.sfasu.edu/astro/color/blackbodyc.txt
   * 
   *   A black body approximation is used where the temperature,
   *   T, is given in Kelvin.  The XYZ values are determined by
   *   "integrating" the product of the wavelength distribution of
   *   energy and the XYZ functions for a uniform source.
   * 
   * @param  {Colors.kelvin}  kelvin        Color temperature in degrees Kelvin; must fall between 1000 and 40000
   * @param  {boolean}        [round=true]
   * @param  {number}         [bitDepth=8]
   * @return {Colors.rgb}
   */
  static kelvin2rgb(kelvin: Colors.kelvin, round: boolean = true, bitDepth: number = 8): Colors.rgb {
    // initialize accumulators
    let xx = 0, yy = 0, zz = 0
    let con = 1240.0/8.617e-5
    let dis, wavelength, weight
    let band, nbands = xyzWavelengths.vectors.length

    // loop over wavelength bands
    // integration by trapezoid method
    for (band = 0; band < nbands; band++) {
      weight = (band == 0 || band == nbands - 1) ? 0.5 : 1

      wavelength = 380 + band * 5

      // generate a black body spectrum
      dis = 3.74183e-16 * (1 / Math.pow(wavelength, 5)) / (Math.exp(con / (wavelength * kelvin.k)) - 1)

      // simple integration over bands
      xx += weight * dis * xyzWavelengths.vectors[band][0]
      yy += weight * dis * xyzWavelengths.vectors[band][1]
      zz += weight * dis * xyzWavelengths.vectors[band][2]
    }

    // re-normalize
    let xxyyzzMax = Math.max(xx, yy, zz)
    let x = xx / xxyyzzMax
    let y = yy / xxyyzzMax
    let z = zz / xxyyzzMax

    let xr = xyzWavelengths.chromaticityCoordinates.r[0]
    let yr = xyzWavelengths.chromaticityCoordinates.r[1]
    let zr = 1 - xr - yr
    let xg = xyzWavelengths.chromaticityCoordinates.g[0]
    let yg = xyzWavelengths.chromaticityCoordinates.g[1]
    let zg = 1 - xg - yg
    let xb = xyzWavelengths.chromaticityCoordinates.b[0]
    let yb = xyzWavelengths.chromaticityCoordinates.b[1]
    let zb = 1 - xb - yb

    // convert to rgb
    let denominator = (xr * yg - xg * yr) * zb + (xb * yr - xr * yb) * zg + (xg * yb - xb * yg) * zr

    let r = ((x  * yg - xg * y ) * zb + (xg * yb - xb * yg) * z  + (xb * y  - x  * yb) * zg) / denominator
    let g = ((xr * y  - x  * yr) * zb + (xb * yr - xr * yb) * z  + (x  * yb - xb * y ) * zr) / denominator
    let b = ((xr * yg - xg * yr) * z  + (x  * yr - xr * y ) * zg + (xg * y  - x  * yg) * zr) / denominator

    r = Math.min(Math.max(r,0),1)
    g = Math.min(Math.max(g,0),1)
    b = Math.min(Math.max(b,0),1)

    // adjust gamma
    let rangeMax = Math.max(1.0e-10, r, g, b)
    r = Math.pow(r / rangeMax, xyzWavelengths.gamma)
    g = Math.pow(g / rangeMax, xyzWavelengths.gamma)
    b = Math.pow(b / rangeMax, xyzWavelengths.gamma)

    // adjust to given bit depth
    let depth = (2 ** bitDepth) - 1
    r *= depth
    g *= depth
    b *= depth
    
    r = Math.min(r,depth)
    g = Math.min(g,depth)
    b = Math.min(b,depth)

    if (round) {
      r = Math.round(r)
      g = Math.round(g)
      b = Math.round(b)
    }
    
    return new Colors.rgb(r, g, b, depth, bitDepth)
  }

  /**
   * Convert a color temperature in Kelvin to RGB
   * Not accurate for scientific purposes
   * Original algorithm from:
   * https://tannerhelland.com/2012/09/18/convert-temperature-rgb-algorithm-code.html
   *
   * @param  {Colors.kelvin}  kelvin    Color temperature in degrees Kelvin; must fall between 1000 and 40000
   * @param  {boolean}        [round=true]
   * @param  {number}         [bitDepth=8]
   * @return {Colors.rgb}
   */
  static kelvin2rgb_deprecated(kelvin: Colors.kelvin, round: boolean = true, bitDepth: number = 8): Colors.rgb {
    let k = kelvin.k / 100
    let max = ((2 ** bitDepth) - 1)
    let scalar = max / 255

    let r;
    let g;
    let b;
    if (k <= 66) {
      r = max;
      g = 99.4708025861 * Math.log(k) - 161.1195681661;
    }
    else {
      r = 329.698727466 * Math.pow(k - 60, -0.1332047592);
      g = 288.1221695283 * Math.pow(k - 60, -0.0755148492);
    }

    if (k >= 66) {
      b = max;
    }
    else if (k <= 19) {
      b = 0;
    }
    else {
      b = 138.5177312231 * Math.log(k - 10) - 305.0447927307;
    }

    r *= scalar;
    g *= scalar;
    b *= scalar;

    r = Math.min(Math.max(r, 0), max);
    g = Math.min(Math.max(g, 0), max);
    b = Math.min(Math.max(b, 0), max);

    if (round) {
      r = Math.round(r);
      g = Math.round(g);
      b = Math.round(b);
    }

    return new Colors.rgb(r, g, b, max, bitDepth)
  }

  /////////// HEXIDECIMAL ///////////

  /**
   * Convert HEX to RGB
   *
   * @param  {Colors.hex} hex
   * @param  {number}     [bitDepth=8]
   * @return {Colors.rgb}
   */
  static hex2rgb(hex: Colors.hex, bitDepth: number = 8): Colors.rgb {
    let r = parseInt(hex.hex.substr(0,2), 16);
    let g = parseInt(hex.hex.substr(2,2), 16);
    let b = parseInt(hex.hex.substr(4,2), 16);

    let max = ((2 ** bitDepth) - 1)
    if (max != 255) {
      r = r / 255 * max;
      g = g / 255 * max;
      b = b / 255 * max;
    }

    return new Colors.rgb(r, g, b, max, bitDepth)
  }

  /**
   * Convert RGB to HEX
   *
   * @param  {Colors.rgb} rgb
   * @param  {number}     [bitDepth=8]
   * @return {Colors.hex}
   */
  static rgb2hex(rgb: Colors.rgb, bitDepth: number = 8): Colors.hex {
    let hexint = this.rgb2hexint(rgb, bitDepth);
    return new Colors.hex(hexint.toString(16).slice(1));
  }

  /**
   * Convert RGB to integer of HEX code
   * 
   * @param  {Colors.rgb} rgb
   * @param  {number}     [bitDepth=8]
   * @return {number}     0xRRGGBB
   */
  static rgb2hexint(rgb: Colors.rgb, bitDepth: number = 8): number {
    let r = rgb.r
    let g = rgb.g
    let b = rgb.b
    if (bitDepth != 8) {
      r = r / ((2 ** bitDepth) - 1) * 255;
      g = g / ((2 ** bitDepth) - 1) * 255;
      b = b / ((2 ** bitDepth) - 1) * 255;
    }
    r = Math.round(r)
    g = Math.round(g)
    b = Math.round(b)

    let hexint = (1 << 24) + (r << 16) + (g << 8) + b;

    return hexint;
  }
}

export = Convert