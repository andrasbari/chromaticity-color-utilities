# chromaticity-color-utilities
 Color utilities for Node.js.
 
 Conversion, modification, and color schemes of: RGB (at any bit depth), HSV, HSL, HSI, CYMK, YIQ, XYZ, xyY, L\*a\*b\*, L\*u\*v\*, Y'PbPr, Y'CbCr, and more.

## Table of Contents

* [Install](#install)
* [Usage](#usage)
* [Color Types and Conversions](#color-types-and-conversions)
  * [RGB: Red, Green, Blue](#rgb--red-green-blue)
  * [HEX: Hexidecimal](#hex--hexidecimal)
  * [Rec. 709 RGB : HD video standard](#rec-709-rgb--hd-video-standard)
  * [Rec. 2020 RGB : UHD video standard](#rec-2020-rgb--uhd-video-standard)
  * [HSV: Hue, Saturation, Value](#hsv--hue-saturation-value)
  * [HSL: Hue, Saturation, Lightness](#hsl--hue-saturation-lightness)
  * [HSI: Hue, Saturation, Intensity](#hsi--hue-saturation-intensity)
  * [CMYK: Cyan, Magenta, Yellow, Black](#cmyk--cyan-magenta-yellow-black)
  * [YIQ: NTSC Color](#yiq--ntsc-color)
  * [XYZ: CIE XYZ](#xyz--cie-xyz)
  * [xyY: CIE xyY](#xyy-cie-xyy)
  * [Lab: CIELAB / L\*a\*b\*](#lab--cielab--lab)
  * [Luv: CIELUV / L\*u\*v\*](#luv--cieluv--luv)
  * [YPbPr: Analog video component signals](#ypbpr--analog-video-component-signals)
  * [YCbCr: Digital video component signals](#ycbcr--digital-video-component-signals)
  * [NM: Wavelengths of Light](#nm--wavelengths-of-light)
  * [Kelvin: Color Temperature Approximation](#kelvin--color-temperature-approximation)
* [Color Spaces and Standard Illuminants](#color-spaces-and-standard-illuminants)
* [Modifying Colors](#modifying-colors)
  * [Blending Two Colors](#blending-two-colors)
  * Darken
  * Lighten
  * Saturate
  * Desaturate
* [Color Scheme Generation](#color-scheme-generation)
  * [Complementary Schemes](#complementary-schemes)
  * [Analogous, Triadic, & Split Complement Schemes](#analogous-triadic--split-complement-schemes)
  * [Tetradic & Square Schemes](#tetradic--square-schemes)
  * Tint Scale
  * Shade Scale
  * Tint & Shade Scale
* [Mathematics](#mathematics)
  * [Normalizing RGB](#normalizing-rgb)
  * [RGB to HSV](#rgb-to-hsv)
  * [HSV to RGB](#hsv-to-rgb)
  * [RGB to HSL](#rgb-to-hsl)
  * [HSL to RGB](#hsl-to-rgb)
  * [RGB to HSI](#rgb-to-hsi)
  * [HSI to RGB](#hsi-to-rgb)
  * [HSV to HSL](#hsv-to-hsl)
  * [HSL to HSV](#hsl-to-hsv)
  * [RGB to CMYK](#rgb-to-cmyk)
  * [CMYK to RGB](#cmyk-to-rgb)
  * [RGB to YIQ](#rgb-to-yiq)
  * [YIQ to RGB](#yiq-to-rgb)
  * [RGB to XYZ](#rgb-to-xyz)
    * [sRGB](#srgb)
    * [L*](#l)
    * [Other color spaces](#other-color-spaces)
  * [XYZ to RGB](#xyz-to-rgb)
    * [sRGB](#srgb-1)
    * [L*](#l-1)
    * [Other color spaces](#other-color-spaces-1)
  * [XYZ to xyY](#xyz-to-xyy)
  * [xyY to XYZ](#xyy-to-xyz)
  * [XYZ to L\*a\*b\*](#xyz-to-lab)
  * [L\*a\*b\* to XYZ](#lab-to-xyz)
  * [XYZ to L\*u\*v\*](#xyz-to-luv)
  * [L\*u\*v\* to XYZ](#luv-to-xyz)
  * [RGB to YPbPr](#rgb-to-ypbpr)
  * [YPbPr to YCbCr](#ypbpr-to-ycbcr)
  * [YCbCr to YPbPr](#ycbcr-to-ypbpr)
* [Compiling from Source](#compiling-from-source)

## Install

`npm install --save chromaticity-color-utilities`

## Usage

Any color can be converted to any other, with only a few caveats. Construction `from()`, conversion `to()`, and modification `modify()` methods can be chained.

Object properties can be accessed directly, e.g. `color.r` for the red channel value.

Most colors will retain their arguments as a part of their object properties, such as bitDepth, colorSpace, etc.

```js
const Color = require('chromaticity-color-utilities')

let color1 = Color.from('rgb',[255,128,0]).to('hsv')
// hsv { h: 34, s: 100, v: 88, a: 100 }

let color2 = Color.from('hex','ff3201').to('rec709rgb', { bitRate: 10 })
// rec709rgb { r: 940, g: 298, b: 67, a: 940, bitDepth: 10, max: 1023 }

let color6 = Color.from('hex', 'ff00ff').to('lab',{
  colorSpace: 'AdobeRGB',
  referenceWhite: 'd50'
})
// lab {
//  l: 67.60166164169028,
//  a: 101.30709261827131,
//  b: -50.813827160707525,
//  colorSpace: 'adobergb1998',
//  referenceWhite: 'd50'
// }

let color7 = Color.from('hsl',[300,100,50]).to('ypbpr',{kb:0.0722, kr:0.2126})
// ypbpr { y: 0.2848, pb: 0.3854278939426601, pr: 0.45415290830581667 }

let color3 = Color.from('rgb',[255,0,0]).modify('blend', {with: Color.from('rgb',[0,255,0])})
// rgb { r: 128, g: 128, b: 0, a: 255, bitDepth: 8, max: 255 }

let color4 = Color.from('rgb',[255,0,0]).modify('blend', {
  with: Color.from('hex','00ff00'),
  amount: 0.4
})
// rgb { r: 153, g: 102, b: 0, a: 255, bitDepth: 8, max: 255 }

let color5 = Color.from('hex','ee5432').modify('blend', {
  with: Color.from('rgb',[234, 100, 20, 64]),
  amount: 1/3
}).to('hsv')
// hsv { h: 15, s: 83, v: 93, a: 75 }

let scheme1 = Color.from('rgb',[200, 180, 0]).scheme('splitComplement')
// [
//   rgb { r: 200, g: 180, b: 0, a: 255, bitDepth: 8, max: 255 },
//   rgb { r: 0, g: 120, b: 200, a: 255, bitDepth: 8, max: 255 },
//   rgb { r: 80, g: 0, b: 200, a: 255, bitDepth: 8, max: 255 }  
// ]

let scheme2 = Color.from('hsl',[180, 80, 48]).scheme('tetradic', { angle: 40 })
// [
//   hsl { h: 180, s: 80, l: 48, a: 100 },
//   hsl { h: 220, s: 80, l: 48, a: 100 },
//   hsl { h: 40, s: 80, l: 48, a: 100 },
//   hsl { h: 0, s: 80, l: 48, a: 100 }
// ]
```

## Color Types and Conversions

For all of the following examples, the same color is used (magenta / 0xFF00FF) to create the color.

Alpha is optional when available. If not defined, it will default to the maximum value for the given bit depth. When converting to a space that does not support alpha, it is ignored. If converting back, alpha will be set to full opacity.

### RGB : Red, Green, Blue

All values are between 0 and `(2 ** bitDepth) - 1`. With a default bit depth of 8, values are within 0-255. A color with a bit depth of 16 will have values ranging from 0-65535.

** 8-bit color is sometimes referred to as 24-bit or 32-bit (8 bits per channel, with 32-bit including an alpha channel). This package uses the more correct implementation of 32-bit meaning 32 bits per channel, and so generally most use cases would fall between 8 and 16 bit color depth.

** A special note: Adobe uses 15+1 bit depth for 16-bit color, where the last bit is simply added to the first 15 bits.

```ts
Color.from('rgb',[r, g, b, a?],{
  bitDepth: number // optional, default = 8
})

.to('rgb',{
  bitDepth: number, // optional, default = 8
  round: boolean    // optional, default = true
})

// e.g.
let color1 = Color.from('rgb',[255, 0, 255])
let color3 = color2.to('rgb')

let color4 = Color.from('rgb',[1023, 0, 1023], { bitDepth: 10 })
```

### HEX : Hexidecimal

May use string or numberical value. Strings are case-insensitive. Short form or long form may be used. # ignored if present.

```ts
Color.from('hex',hex)

.to('hex')

// e.g.
let color1 = Color.from('hex', 'ff00ff')
let color1 = Color.from('hex', '#FF00FF')
let color1 = Color.from('hex', 0xFF00FF)

let color3 = color2.to('hex')
```

### Rec. 709 RGB : HD video standard

Limits RGB color to video levels (16 - 235 for 8-bit or 64 to 940 for 10-bit). Input bit depth must be 8 or 10. Conversion to Y'PbPr and Y'CbCr will fail as this module does not yet have gamma adjustment implemented.

This method does not currently support data levels.

RGB values _may fall outside limits_.

Alpha channel maintains data levels (0 - 255 / 0 - 1023).

```ts
Color.from('rec709rgb',[r, g, b, a?], {
  round: boolean,  // optional, defaults to true
  bitDepth: number // optional, defaults to 8, must be 8 or 10
})

.to('rec709rgb', {
  round: boolean,  // optional, defaults to true
  bitDepth: number // optional, defaults to 8, must be 8 or 10
})

// e.g.
let color1 = Color.from('rec709rgb', [235, 16, 235])
let color1 = Color.from('rec709rgb', [940, 64, 940], { bitDepth: 10 })

let color3 = color2.to('rec709rgb')
let color3 = color2.to('rec709rgb', { bitDepth: 10 })
```

### Rec. 2020 RGB : UHD video standard

Limits RGB color to video levels (64 to 940 for 10-bit or 256 to 3760 for 12-bit). Input bit depth must be 10 or 12. Conversion to Y'PbPr and Y'CbCr will fail as this module does not yet have gamma adjustment implemented.

This method does not currently support data levels.

RGB values _may fall outside limits_.

Alpha channel maintains data levels (0 - 1023 / 0 - 4096).

```ts
Color.from('rec2020rgb',[r, g, b, a?], {
  round: boolean,  // optional, defaults to true
  bitDepth: number // optional, defaults to 10, must be 10 or 12
})

.to('rec2020rgb', {
  round: boolean,  // optional, defaults to true
  bitDepth: number // optional, defaults to 10, must be 10 or 12
})

// e.g.
let color1 = Color.from('rec2020rgb', [940, 64, 940])
let color1 = Color.from('rec2020rgb', [3760, 256, 3760], { bitDepth: 12 })

let color3 = color2.to('rec2020rgb')
let color3 = color2.to('rec2020rgb', { bitDepth: 10 })
```

### HSV : Hue, Saturation, Value

Hue value is between 0 and 360. Saturation, value, and alpha are between 0 and 100 (as in, percent).

```ts
Color.from('hsv',[h, s, v, a?])

.to('hsv',{
  round: boolean // optional, default = true
})

// e.g.
let color1 = Color.from('hsv',[300, 100, 100])
let color3 = color2.to('hsv')
```

### HSL : Hue, Saturation, Lightness

Hue value is between 0 and 360. Saturation, lightness, and alpha are between 0 and 100 (as in, percent).

```ts
Color.from('hsl',[h, s, l, a?])

.to('hsl',{
  round: boolean // optional, default = true
})

// e.g.
let color1 = Color.from('hsl',[300, 100, 50])
let color3 = color2.to('hsl')
```

### HSI : Hue, Saturation, Intensity

Hue value is between 0 and 360. Saturation, intensity, and alpha are between 0 and 100 (as in, percent).

```ts
Color.from('hsi',[h, s, v, a?])

.to('hsi',{
  round: boolean // optional, default = true
})

// e.g.
let color1 = Color.from('hsi',[300, 100, 67])
let color3 = color2.to('hsi')
```

### CMYK : Cyan, Magenta, Yellow, Black

All values are between 0 and 100 (as in, percent).

** Calculations do not take pigment conversion into account and should not be used to reference printed colors.

```ts
Color.from('cmyk',[c, m, y, k])

.to('cmyk',{
  round: boolean // optional, default = true
})

// e.g.
let color1 = Color.from('cmyk',[0, 100, 0, 0])
let color3 = color2.to('cmyk')
```

### YIQ : NTSC Color

* Y = luma
* I = in-phase
* Q = quadrature

When normalized:

* Y is between 0 and 255
* I and Q are between -128 and 128

When not normalized:

* Y is between 0 and 1
* I is between -0.5957 and 0.5957
* Q is between -0.5226 and 0.5226

```ts
Color.from('yiq', [y, i, q], {
  normalized: boolean // optional, default = true
})

.to('yiq',{
  normalize: boolean, // optional, default = true
  round: boolean      // optional, default = true (ignored/false if not normalized)
})

// e.g.
let color1 = Color.from('yiq',[105, 59, 128])
let color3 = color2.to('yiq')

let color4 = Color.from('yiq', [0.413, 0.2746, 0.5226], {normalized: false})
```

### XYZ : CIE XYZ

All values are between 0 and 1. XYZ is only defined within the constraints of a color space and reference white point of a standard illuminant. If one is not given, sRGB and D65 are used as the color space and standard illuminant.

* X = mix of three CIE RGB curves chosen to be non-negative
* Y = luminance
* Z = quasi-equal to blue

It is not often useful to convert _to_ XYZ, as XYZ defines real-world light and is typically then converted to a digital representation (most commonly RGB), but the functionality is present nonetheless.

Available Color Spaces and Stardard Illuminants below.

```ts
Color.from('xyz', [x, y, z], {
  colorSpace: string,    // optional, default = 'srgb'
  referenceWhite: string // optional, default = 'd65'
})

.to('xyz',{
  colorSpace: string,    // optional, default = 'srgb'
  referenceWhite: string // optional, default = 'd65'
})

// e.g.
let color1 = Color.from('xyz',[0.5928939, 0.2848479, 0.969638])
let color3 = color2.to('xyz')

let color4 = Color.from('xyz', [0.7589799, 0.3743439, 0.7643198], {
  colorSpace: 'adobergb',
  referenceWhite: 'd50'
})
```

### xyY : CIE xyY

Derived from XYZ, x and y are chromaticity values while Y is the tristimulous value of a color.

Available Color Spaces and Stardard Illuminants below.

```ts
Color.from('xyy', [x, y, Y], {
  colorSpace: string,    // optional, default = 'srgb'
  referenceWhite: string // optional, default = 'd65'
})

.to('xyy',{
  colorSpace: string,    // optional, default = 'srgb'
  referenceWhite: string // optional, default = 'd65'
})

// e.g.
let color1 = Color.from('xyy',[0.3209377411185291, 0.1541902211986945, 0.2848479])
let color3 = color2.to('xyy')

let color4 = Color.from('xyz', [
  0.39995913879719036,
  0.1972677588141419,
  0.3743439
], {
  colorSpace: 'adobergb',
  referenceWhite: 'd50'
})
```

### Lab : CIELAB / L\*a\*b\*

Derived from XYZ.

* L* = lightness
* a* = position between red and green (negative indicates green, positive red)
* b* = position between blue and yellow (negative indicates blue, positive yellow)

Available Color Spaces and Stardard Illuminants below.

```ts
Color.from('lab', [l, a, b], {
  colorSpace: string,    // optional, default = 'srgb'
  referenceWhite: string // optional, default = 'd65'
})

.to('lab',{
  colorSpace: string,    // optional, default = 'srgb'
  referenceWhite: string // optional, default = 'd65'
})

// e.g.
let color1 = Color.from('lab',[
  60.32421212836874,
  98.23431188800397,
  -60.82489220885006
])
let color3 = color2.to('lab')

let color4 = Color.from('lab', [
  67.60166164169028,
  101.30709261827131,
  -5.488771094285516
], {
  colorSpace: 'adobergb',
  referenceWhite: 'd50'
})
```

### Luv : CIELUV / L\*u\*v\*

Derived from XYZ. L\* is identical to L\* in L\*a\*b\*

Available Color Spaces and Stardard Illuminants below.

```ts
Color.from('luv', [l, u, v], {
  colorSpace: string,    // optional, default = 'srgb'
  referenceWhite: string // optional, default = 'd65'
})

.to('luv',{
  colorSpace: string,    // optional, default = 'srgb'
  referenceWhite: string // optional, default = 'd65'
})

// e.g.
let color1 = Color.from('luv',[
  60.32421212836874,
  84.07139572483507,
  -108.68333851910185
])
let color3 = color2.to('luv')

let color4 = Color.from('luv', [
  67.60166164169028,
  124.0201282170453,
  -87.3117870588082
], {
  colorSpace: 'adobergb',
  referenceWhite: 'd50'
})
```

### YPbPr : Analog video component signals

Also written Y'PbPr or YP<sub>B</sub>P<sub>R</sub>.

* Y' = luma and sync (brightness/luminance and syncrhonization)
* Pb = difference between blue and luma (B - Y)
* Pr = difference between red and luma (R - Y)

YPbPr conversions require Kb and Kr constants with the exception of converting to YCbCr. These values are not yet included in this package.

* Kb = constant defined from target color space, such that Kb + Kr + Kg = 1
* Kr = constant defined from target color space, such that Kb + Kr + Kg = 1

```ts
Color.from('ypbpr', [y, pb, pr])

.to('ypbpr',{
  kb: number, // REQUIRED
  kr: number  // REQUIRED
})

// YCbCr conversion
.to('ycbcr',{
  yLower: number, // optional, default = 16,  lower bounds of Y'
  yUpper: number, // optional, default = 235, upper bounds of Y'
  cLower: number, // optional, default = 16,  lower bounds of Cb and Cr
  cUpper: number  // optional, default = 240, upper bounds of Cb and Cr
})

// e.g.
let color1 = Color.from('ypbpr',[
  0.2848,
  0.3854278939426601,
  0.45415290830581667
])
let color3 = color2.to('ypbpr',{
  kb: 0.0722, // Rec709
  kr: 0.2126  // Rec709
})
let color4 = color1.to('ycbcr')
let color5 = color1.to('ycbcr',{
  yLower: 0,
  yUpper: 255,
  cLower: 0,
  cUpper: 255
})
```

### YCbCr : Digital video component signals

Also written Y'CbCr, Y Pb/Cb Pr/Cr, YC<sub>B</sub>C<sub>R</sub>, or Y'C<sub>B</sub>C<sub>R</sub>.

* Y' = luma and sync (brightness/luminance and syncrhonization)
* Cb = difference between blue and luma (B - Y)
* Cr = difference between red and luma (R - Y)

YCbCr conversions require Kb and Kr constants with the exception of converting to YPbPr. These values are not yet included in this package.

* Kb = constant defined from target color space, such that Kb + Kr + Kg = 1
* Kr = constant defined from target color space, such that Kb + Kr + Kg = 1

```ts
Color.from('ycbcr', [y, cb, cr])

.to('ycbcr',{
  kb: number, // REQUIRED
  kr: number  // REQUIRED
})

// YPbPr conversion
.to('ypbpr',{
  yLower: number, // optional, default = 16,  lower bounds of Y'
  yUpper: number, // optional, default = 235, upper bounds of Y'
  cLower: number, // optional, default = 16,  lower bounds of Cb and Cr
  cUpper: number  // optional, default = 240, upper bounds of Cb and Cr
})

// e.g.
let color1 = Color.from('ycbcr', [73, 226, 243])
let color3 = color2.to('ycbcr',{
  kb: 0.0722, // Rec709
  kr: 0.2126  // Rec709
})
let color4 = color1.to('ypbpr')
let color5 = color1.to('ypbpr',{
  yLower: 0,
  yUpper: 255,
  cLower: 0,
  cUpper: 255
})
```

### NM : Wavelengths of light

This is a one-way approximation and is hugely perceptual. There is no `.to('nm')` method option.

```ts
Color.from('nm', wavelength)

// e.g.
let color1 = Color.from('nm',600).to('rgb')
// rgb { r: 255, g: 190, b: 0, a: 255, bitDepth: 8, max: 255 }
```

### Kelvin : Color Temperature Approximation

This is a one-way approximatin. There is no `.to('kelvin')` method option.

```ts
Color.from('kelvin', degrees)

// e.g.
let color1 = Color.from('kelvin',3500).to('rgb')
// rgb { r: 255, g: 193, b: 141, a: 255, bitDepth: 8, max: 255 }
```

## Color Spaces and Standard Illuminants

For conversion to and from XYZ, xyY, L\*a\*b\*, and L\*u\*v\*, the following color spaces and standard illuminants have XYZ transformation matrices and reference white point vectors available:

|Color Space|Standard Illuminants|
|---|---|
|sRGB|D65, D50|
|CIE RGB|E, D50|
|Adobe RGB|D65, D50|
|Apple RGB|D65, D50|
|Best RGB|D50|
|Bruce RGB|D65, D50|
|ColorMatch RGB|D50|
|Don RGB 4|D50|
|ECI RGB v2|D50|
|Ekta Space PS5|D50|
|NTSC RGB|C, D50|
|PAL / SECAM RGB|D65, D50|
|ProPhoto RGB|D50|
|SMPTE-C RGB|D65, D50|
|Wide Gamut RGB|D50|

Color spaces and standard illuminant arguments are case-insensitive. Color space argument ignores any character not alphanumeric. Some common misspellings / words left out are also taken into account. (`PAL / SECAM` is equivalent to `palsecamrgb`.)

## Modifying Colors

### Blending Two Colors

When blending two colors, the amount ∈ [0,1] refers to the percentage the second color is blended with the first. In other words, 0 means 0% of the second color and 100% of the first while 1 means 100% of the second color and 0% of the first.

```ts
let color3 = color1.modify('blend', {
  with: color2,  // REQUIRED, can be any color of any type
  amount: number // optional, 0 - 1, defaults to 0.5
})

// e.g.
let color4 = Color.from('rgb',[255,0,0]).modify('blend', {
  with: Color.from('hex','00ff00')
})
// rgb { r: 128, g: 128, b: 0, a: 255, bitDepth: 8, max: 255 }

let color5 = Color.from('hex','ee5432').modify('blend', {
  with: Color.from('rgb',[234, 100, 20, 64]),
  amount: 1/3
}).to('hsv')
// hsv { h: 15, s: 83, v: 93, a: 75 }
```

### Darken

todo

### Lighten

todo

### Saturate

todo

### Desaturate

todo

## Color Scheme Generation

Schemes can be generated from any color type. All methods return an array of colors, each the same as the input type. (If calling method on a color of type `hsl`, all values of the returned array will be of type `hsl`.)

```ts
.scheme(type: string)
// or
.scheme(type: string, {
  angle: number // optional, hue shift angle in degrees
})
```

### Complementary Schemes

Complementary color scheme generation has a fixed angle of 180&deg;.

```ts
.scheme('complement') // angle = 180

// e.g.
let color1 = Color.from('rgb',[255,0,255]).scheme('complement')
// [
//   rgb { r: 255, g: 0, b: 255, a: 255, bitDepth: 8, max: 255 },
//   rgb { r: 0, g: 255, b: 0, a: 255, bitDepth: 8, max: 255 }
// ]
```

### Analogous, Triadic, & Split Complement Schemes

These three methods are synonyms with different default angles.

```ts
.scheme('analogous', {
  angle: number // optional, default = 30
})
.scheme('triadic', {
  angle: number // optional, default = 120
})
.scheme('splitcomplement', {
  angle: number // optional, default = 150
})

// e.g.
let color1 = Color.from('rgb',[255,0,255]).scheme('analogous')
// [
//   rgb { r: 255, g: 0, b: 255, a: 255, bitDepth: 8, max: 255 },
//   rgb { r: 128, g: 255, b: 0, a: 255, bitDepth: 8, max: 255 },
//   rgb { r: 0, g: 255, b: 128, a: 255, bitDepth: 8, max: 255 }
// ]
let color2 = Color.from('rgb',[255,0,255]).scheme('triadic')
// [
//   rgb { r: 255, g: 0, b: 255, a: 255, bitDepth: 8, max: 255 },
//   rgb { r: 255, g: 255, b: 0, a: 255, bitDepth: 8, max: 255 },
//   rgb { r: 0, g: 255, b: 255, a: 255, bitDepth: 8, max: 255 }
// ]
let color3 = Color.from('rgb',[255,0,255]).scheme('splitcomplement',{angle: 160})
// [
//   rgb { r: 255, g: 0, b: 255, a: 255, bitDepth: 8, max: 255 },
//   rgb { r: 85, g: 255, b: 0, a: 255, bitDepth: 8, max: 255 },
//   rgb { r: 0, g: 255, b: 85, a: 255, bitDepth: 8, max: 255 }
// ]
```

### Tetradic & Square Schemes

These two methods are synonyms, but that the square method has a fixed angle of 90&deg;.

```ts
.scheme('tetradic', {
  angle: number // optional, default = 45
})
.scheme('square') // angle = 90

// e.g.
let color1 = Color.from('rgb',[255,0,255]).scheme('tetradic',{angle: 42})
// [
//   rgb { r: 255, g: 0, b: 255, a: 255, bitDepth: 8, max: 255 },
//   rgb { r: 255, g: 0, b: 76, a: 255, bitDepth: 8, max: 255 },
//   rgb { r: 0, g: 255, b: 179, a: 255, bitDepth: 8, max: 255 },
//   rgb { r: 0, g: 255, b: 0, a: 255, bitDepth: 8, max: 255 }
// ]
let color2 = Color.from('rgb',[255,0,255]).scheme('square')
// [
//   rgb { r: 255, g: 0, b: 255, a: 255, bitDepth: 8, max: 255 },
//   rgb { r: 255, g: 128, b: 0, a: 255, bitDepth: 8, max: 255 },
//   rgb { r: 0, g: 128, b: 255, a: 255, bitDepth: 8, max: 255 },
//   rgb { r: 0, g: 255, b: 0, a: 255, bitDepth: 8, max: 255 }
// ]
```

### Tint Scale

todo / not yet implemented

```ts
.scheme('tint',{
  length: number,  // number of colors in scheme
  distance: number // 0-1, how far away from white to go
})
```

### Shade Scale

todo / not yet implemented

```ts
.scheme('shade',{
  length: number,  // number of colors in scheme
  distance: number // 0-1, how far away from black to go
})
```

### Tint & Shade Scale

todo / not yet implemented

```ts
.scheme('tintshade',{
  length: number,  // number of colors in scheme
  distance: number // 0-1, how far away from closest bound (white or black) to go
})
```

## Mathematics

The following are the formulae used in the conversion algorithms. For succinctness, consider all values normalized ∈ [0, 1] unless stated otherwise.

### Normalizing RGB

to achieve R,G,B ∈ [0, 1]

![](https://raw.githubusercontent.com/reiniiriarios/chromaticity-color-utilities/master/math/normalizing-xp.png)

![](https://raw.githubusercontent.com/reiniiriarios/chromaticity-color-utilities/master/math/normalizing-x.png)

### RGB to HSV

![](https://raw.githubusercontent.com/reiniiriarios/chromaticity-color-utilities/master/math/rgb-hsv-v.png)

![](https://raw.githubusercontent.com/reiniiriarios/chromaticity-color-utilities/master/math/rgb-hsv-c.png)

![](https://raw.githubusercontent.com/reiniiriarios/chromaticity-color-utilities/master/math/rgb-hsv-s.png)

![](https://raw.githubusercontent.com/reiniiriarios/chromaticity-color-utilities/master/math/rgb-hsv-h.png)

### HSV to RGB

![](https://raw.githubusercontent.com/reiniiriarios/chromaticity-color-utilities/master/math/hsv-rgb-p.png)

![](https://raw.githubusercontent.com/reiniiriarios/chromaticity-color-utilities/master/math/hsv-rgb-q.png)

![](https://raw.githubusercontent.com/reiniiriarios/chromaticity-color-utilities/master/math/hsv-rgb-t.png)

![](https://raw.githubusercontent.com/reiniiriarios/chromaticity-color-utilities/master/math/hsv-rgb-rgb.png)

<!--
(R,G,B) =
\begin{cases}
(V,V,V) & \text{ if } S = 0 \\ 
(V,t,p) & \text{ if } H < 1 \\
(q,V,p) & \text{ if } 1 < H \leq 2 \\
(p,V,t) & \text{ if } 2 < H \leq 3 \\
(p,q,V) & \text{ if } 3 < H \leq 4 \\
(t,p,V) & \text{ if } 4 < H \leq 5 \\
(V,p,q) & \text{ otherwise } \\
\end{cases}
-->

### RGB to HSL

![](https://raw.githubusercontent.com/reiniiriarios/chromaticity-color-utilities/master/math/rgb-hsv-v.png)

![](https://raw.githubusercontent.com/reiniiriarios/chromaticity-color-utilities/master/math/rgb-hsv-c.png)

![](https://raw.githubusercontent.com/reiniiriarios/chromaticity-color-utilities/master/math/rgb-hsl-l.png)

![](https://raw.githubusercontent.com/reiniiriarios/chromaticity-color-utilities/master/math/rgb-hsl-s.png)

### HSL to RGB

![](https://raw.githubusercontent.com/reiniiriarios/chromaticity-color-utilities/master/math/hsl-rgb-c.png)

![](https://raw.githubusercontent.com/reiniiriarios/chromaticity-color-utilities/master/math/hsl-rgb-x.png)

![](https://raw.githubusercontent.com/reiniiriarios/chromaticity-color-utilities/master/math/hsl-rgb-r1g1b1.png)

![](https://raw.githubusercontent.com/reiniiriarios/chromaticity-color-utilities/master/math/hsl-rgb-m.png)

![](https://raw.githubusercontent.com/reiniiriarios/chromaticity-color-utilities/master/math/hsl-rgb-rgb.png)

<!--
(R_{1},G_{1},B_{1}) =
\begin{cases}
(0,0,0) & \text{ if } H \: \mathrm{undefined} \\ 
(C,x,0) & \text{ if } 0 < H \leq 1 \\
(x,C,0) & \text{ if } 1 < H \leq 2 \\
(0,C,x) & \text{ if } 2 < H \leq 3 \\
(0,x,C) & \text{ if } 3 < H \leq 4 \\
(x,0,C) & \text{ if } 4 < H \leq 5 \\
(C,0,x) & \text{ if } 5 < H \leq 6 \\
\end{cases}
-->

### RGB to HSI

![](https://raw.githubusercontent.com/reiniiriarios/chromaticity-color-utilities/master/math/rgb-hsv-v.png)

![](https://raw.githubusercontent.com/reiniiriarios/chromaticity-color-utilities/master/math/rgb-hsv-c.png)

![](https://raw.githubusercontent.com/reiniiriarios/chromaticity-color-utilities/master/math/rgb-hsi-h.png)

![](https://raw.githubusercontent.com/reiniiriarios/chromaticity-color-utilities/master/math/rgb-hsi-i.png)

<!--
H=\begin{cases}
0 & \text{ if } C=0 \\ 
\frac{G - B}{C} \: \mathrm{ mod } \: 6 & \text{ if } V=R \\ 
\frac{B - R}{C} + 2 & \text{ if } V=G \\ 
\frac{R - G}{C} + 4 & \text{ if } V=B \\ 
\end{cases}

I=\begin{cases}
0 & \text{ if } C=0 \\ 
(R + G + B) \cdot \frac{1}{3} & \text{ otherwise }
\end{cases}
-->

### HSI to RGB

![](https://raw.githubusercontent.com/reiniiriarios/chromaticity-color-utilities/master/math/hsi-rgb-z.png)

![](https://raw.githubusercontent.com/reiniiriarios/chromaticity-color-utilities/master/math/hsi-rgb-c.png)

![](https://raw.githubusercontent.com/reiniiriarios/chromaticity-color-utilities/master/math/hsi-rgb-x.png)

![](https://raw.githubusercontent.com/reiniiriarios/chromaticity-color-utilities/master/math/hsl-rgb-r1g1b1.png)

![](https://raw.githubusercontent.com/reiniiriarios/chromaticity-color-utilities/master/math/hsi-rgb-m.png)

![](https://raw.githubusercontent.com/reiniiriarios/chromaticity-color-utilities/master/math/hsl-rgb-rgb.png)

### HSV to HSL

![](https://raw.githubusercontent.com/reiniiriarios/chromaticity-color-utilities/master/math/hsv-hsl-l.png)

![](https://raw.githubusercontent.com/reiniiriarios/chromaticity-color-utilities/master/math/hsv-hsl-s.png)

### HSL to HSV

![](https://raw.githubusercontent.com/reiniiriarios/chromaticity-color-utilities/master/math/hsl-hsv-v.png)

![](https://raw.githubusercontent.com/reiniiriarios/chromaticity-color-utilities/master/math/hsl-hsv-s.png)

### RGB to CMYK

```
K = 1 - max(R,G,B)

C = | 0                      if K = 1
    | (1 - R - K) / (1 - K)  otherwise
    
M = | 0                      if K = 1
    | (1 - G - K) / (1 - K)  otherwise
    
Y = | 0                      if K = 1
    | (1 - B - K) / (1 - K)  otherwise
```

### CMYK to RGB

```
R = (1 - C) * (1 - K)
G = (1 - M) * (1 - K)
B = (1 - Y) * (1 - K)
```

### RGB to YIQ

```
[Y]   [0.299    0.587    0.114 ]   [R]
[I] = [0.5959  -0.2746  -0.3213] * [G]
[Q]   [0.2115  -0.5227   0.3112]   [B]

Y ∈ [0,1]
I ∈ [-0.5957,0.5957]
Q ∈ [-0.5226,0.5226]

or, normalized

Y ∈ [0,255]
I ∈ [-128, 128]
Q ∈ [-128, 128]
```

### YIQ to RGB

```
Y ∈ [0,1]
I ∈ [-0.5957,0.5957]
Q ∈ [-0.5226,0.5226]

[R]   [1   0.956   0.621]   [Y]
[G] = [1  -0.272  -0.647] * [I]
[B]   [1  -1.106   1.703]   [Q]
```

### RGB to XYZ

M = 3x3 RGB to XYZ transformation matrix based on color space and standard illuminant reference white

#### sRGB

```
for X = (R,G,B)
X' = | X / 12.92                    if X <= 0.04045
     | ((X + 0.055) / 1.055) ^ 2.4  otherwise

[X]       [R']
[Y] = M * [G']
[Z]       [B']
```

#### L*

```
κ = 903.3, CIE-K

for X = (R,G,B)
X' = | 100 * (R / κ)            if R <= 0.08
     | ((R + 0.16) / 1.16) ^ 3  otherwise

[X]       [R']
[Y] = M * [G']
[Z]       [B']
```

#### Other color spaces

```
γ based on target color space

for X = (R,G,B)
X' = X ^ γ

[X]       [R']
[Y] = M * [G']
[Z]       [B']
```

### XYZ to RGB

M = 3x3 XYZ to RGB transformation matrix based on color space and standard illuminant reference white

#### sRGB

```
[R']       [X]
[G'] = M * [Y]
[B']       [Z]

for X' = (R',G',B')
X = | X' * 12.92                        if X' <= 0.0031308
    | (X' * 1.055) ^ (1 / 2.4) - 0.055  otherwise
```

#### L*

```
[R']       [X]
[G'] = M * [Y]
[B']       [Z]

ϵ = 0.008856, CIE-E 
κ = 903.3, CIE-K

for X' = (R',G',B')
X = | X' * κ / 100              if X' <= ϵ
    | 1.16 * X' ^ (1/3) - 0.16  otherwise
```

#### Other color spaces

```
γ based on target color space

[R']       [X]
[G'] = M * [Y]
[B']       [Z]

for X' = (R',G',B')
X = X' ^ (1 / γ)
```

### XYZ to xyY

```
x = X / (X + Y + Z)

y = Y / (X + Y + Z)

Y = Y
```

### xyY to XYZ

```
X = (x * Y) / y

Y = Y

Z = ((1 - x - y) * Y) / y
```

### XYZ to L\*a\*b\*

```
W is a 1x3 reference white vector based on standard illuminant

ϵ = 0.008856, CIE-E 
κ = 903.3, CIE-K

X' = X / W[0]
Y' = Y / W[1]
Z' = Z / W[2]

f(n) = | n' ^ 1/3             if n > ϵ
       | (κ * n' + 16) / 116  otherwise

L* = 116 * f(Y) - 16
a* = 500 * (f(X) - f(Y))
b* = 200 * (f(Y) - f(Z))
```

### L\*a\*b\* to XYZ

```
W is a 1x3 reference white vector based on standard illuminant

ϵ = 0.008856, CIE-E 
κ = 903.3, CIE-K

L' = (L* + 16) / 116
a' = a* / 500 + L'
b' = L' - b* / 200

X' = | a' ^ 3               if a' ^ 3 > ϵ
     | (116 * a' - 16) / κ  otherwise

Y' = | (L' ^ 3  if L* > κ * ϵ
     | L* * κ   otherwise

Z' = | b' ^ 3               if b' ^ 3 > ϵ
     | (116 * b' - 16) / κ  otherwise

X = X' * W[0]
Y = Y' * W[1]
Z = Z' * W[2]
```

### XYZ to L\*u\*v\*

```
W is a 1x3 reference white vector based on standard illuminant

ϵ = 0.008856, CIE-E 
κ = 903.3, CIE-K

Y' = Y / W[1]

d = X + 15 * Y + 3 * Z

u' = | 0       if d = 0
     | 4X / d  otherwise

v' = | 0       if d = 0
     | 9Y / d  otherwise

L* = | 116 * Y' ^ 1/3  if Y' > ϵ
     | Y' * κ          otherwise

u'r = (4 * W[1]) / (W[0] + 15 * W[1] + 3 * W[2])
v'r = (9 * W[1]) / (W[0] + 15 * W[1] + 3 * W[2])

u* = 13 * L* * (u' - u'r)
v* = 13 * L* * (v' - v'r)
```

### L\*u\*v\* to XYZ

```
W is a 1x3 reference white vector based on standard illuminant

ϵ = 0.008856, CIE-E 
κ = 903.3, CIE-K

Y = | ((L* + 16) / 116) ^ 3  if L* > κ * ϵ
    | L* / κ                 otherwise

u0 = (4 * W[0]) / (W[0] + 15 * W[1] + 3 * W[2])
v0 = (9 * W[0]) / (W[0] + 15 * W[1] + 3 * W[2])

a = 1/3 * (((52 * L*) / (u* + 13 * L* * u0))) - 1)
b = -5Y
c = -1/3
d = Y * (((39 * L*) / (v* + 13 * L* * v0)) - 5)

X = (d - b) / (a - c)
Z = X * a + b
```

### RGB to YPbPr

```
Kb and Kr constants defined from target color space

Kg = 1 - Kb - Kr

Y = Kr * R + Kg * G + Kb * B

Pb = 0.5 * ((B - Y) / (1 - Kb))
Pr = 0.5 * ((R - Y) / (1 - Kr))
```

### YPbPr to YCbCr

```
Scaling bounds given by conversion method / target space. Such as:

Y scaled to:       0 - 255 JPEG
                  16 - 235 Rec709
Cb, Cr scaled to:  0 - 255 JPEG
                  16 - 245 Rec709
```

### YCbCr to YPbPr

```
Y scaled to:         0 - 1
Pb, Pr scaled to: -0.5 - 0.5
```

### YPbPr to RGB

```
Kb and Kr constants defined from target color space

Kg = 1 - Kb - Kr

R = Y + (2 - 2Kr) * Pr
G = Y + (-1 * (Kb / Kg) * (2 - 2Kb)) * Pb + (-1 * (Kr / Kg) * (2 - 2Kr)) * Pr
B = Y + (2 - 2Kb) * Pb
```

## Compiling from Source

`git clone https://github.com/reiniiriarios/chromaticity-color-utilities.git`

`cd chromaticity-color-utilities`

`npm install`

`tsc`