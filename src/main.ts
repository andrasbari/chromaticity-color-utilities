// chromaticity-color-utilities
// Copyright (C) 2021 Emma Litwa-Vulcu
// 
// This program is free software: you can redistribute it and/or modify
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

interface newColorArgs {
    bitDepth?: number
    bitRate?: number
    normalized?: boolean
    colorSpace?: string
    referenceWhite?: string
}

interface colorDef {
    from(type: string, value: number[]|string, args?: newColorArgs) : Colors.colorType
}

class Color implements colorDef {
    from(type: string, value: number[]|string, args?: newColorArgs) : Colors.colorType {
        if (typeof args === 'undefined') args = {}
        if (typeof args.bitDepth === 'undefined' && typeof args.bitRate !== 'undefined') {
            args.bitDepth = args.bitRate
        }
        if (typeof value === 'string') {
            if (type == 'hex') return new Colors.hex(value)
            else throw new Error('Unable to parse color')
        }
        else {
            switch (type) {
                case 'rgb':
                case 'rgba':
                    if (typeof args.bitDepth === 'undefined') args.bitDepth = 8
                    if (typeof value[4] === 'undefined') value[4] = (2 ** args.bitDepth) - 1
                    return new Colors.rgb(value[0], value[1], value[2], value[4], args.bitDepth)
                case 'rec709':
                case 'rgb709':
                case 'rec709rgb':
                case 'rgbrec709':
                    if (typeof args.bitDepth === 'undefined') args.bitDepth = 8
                    if (typeof value[4] === 'undefined') value[4] = (2 ** args.bitDepth) - 1
                    return new Colors.rec709rgb(value[0], value[1], value[2], value[4], args.bitDepth)
                case 'rec2020':
                case 'rgb2020':
                case 'rec2020rgb':
                case 'rgbrec2020':
                    if (typeof args.bitDepth === 'undefined') args.bitDepth = 10
                    if (typeof value[4] === 'undefined') value[4] = (2 ** args.bitDepth) - 1
                    return new Colors.rec2020rgb(value[0], value[1], value[2], value[4], args.bitDepth)
                case 'hsv':
                case 'hsva':
                    if (typeof value[4] === 'undefined') value[4] = 100
                    return new Colors.hsv(value[0], value[1], value[2], value[4])
                case 'hsl':
                case 'hsla':
                    if (typeof value[4] === 'undefined') value[4] = 100
                    return new Colors.hsl(value[0], value[1], value[2], value[4])
                case 'hsi':
                case 'hsia':
                    if (typeof value[4] === 'undefined') value[4] = 100
                    return new Colors.hsi(value[0], value[1], value[2], value[4])
                case 'cmyk':
                    return new Colors.cmyk(value[0], value[1], value[2], value[4])
                case 'yiq':
                    return new Colors.yiq(value[0], value[1], value[2], args.normalized)
                case 'xyz':
                    return new Colors.xyz(value[0], value[1], value[2], args.colorSpace, args.referenceWhite)
                default:
                    throw new Error('Unable to determine color type')
            }
        }
    }
}

export = new Color