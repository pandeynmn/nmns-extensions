import { Response } from 'paperback-extensions-common'
const fonts: any = {
    sanfrancisco18: require('./external/sanfrancisco18.json'),
    sanfrancisco24: require('./external/sanfrancisco24.json'),
    sanfrancisco30: require('./external/sanfrancisco30.json'),
    sanfrancisco36: require('./external/sanfrancisco36.json'),
}

const BMP_HEADER1 = [0x42, 0x4D]
// insert 4 bytes of file size here, little-endian, 54 bytes header + img data size
const BMP_HEADER2 = [0x00, 0x00, 0x00, 0x00, 0x36, 0x00, 0x00, 0x00, 0x28, 0x00, 0x00, 0x00]
// insert 4 bytes of pixel width, 4 bytes of pixel height, little-endian
const BMP_HEADER3 = [0x01, 0x00, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00]
// insert 4 bytes of image data size, 4 bytes of width res in px/mtr, 4 bytes of height res in px/mtr, little-endian
const BMP_HEADER4 = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
// insert image data here, little-endian (B-G-R), ensure all lines end in a 4-byte multiple

/**
 * Turns an array of colors into a bitmap image.
 * @param data a 3d number array containing 3-long arrays specifying the color at each pixel
 * @returns a Uint8Array containing the raw bitmap data
 */

function writeImageData(data: number[][][]): Uint8Array {
    let imgdata: number[] = []
    const width = data[0]!.length
    const bytewidth = Math.ceil(data[0]!.length*3/4)*4
    const height = data.length
    const size = bytewidth*height
    const filesize = size+54
    for(let i = data.length - 1; i >= 0; i--) { // bitmaps write bottom to top, left to right for whatever reason
        for(let j = 0; j < data[0]!.length; j++) {
            imgdata.push(...data[i]![j]!)
        }
        for(let j = data[0]!.length*3; j < bytewidth; j++) {
            imgdata.push(0x00)
        }
    }
    return Uint8Array.from([...BMP_HEADER1, ...littleEndianify(4, filesize), ...BMP_HEADER2, ...littleEndianify(4, width), ...littleEndianify(4, height), ...BMP_HEADER3, ...littleEndianify(4, size), 0x13, 0x0b, 0x00, 0x00, 0x13, 0x0b, 0x00, 0x00, ...BMP_HEADER4, ...imgdata])
}

/**
 * Turns a number into an array containing the little-endian representation of it.
 * @param size the size of the returned array in bytes
 * @param data the number to turn into little-endian form
 * @returns an array of bytes in little-endian order
 */
function littleEndianify(size: number, data: number): number[] {
    const arr = []
    for(let i = 0; i < size; i++) {
        arr.push((data >> (i*8) & 0x000000ff))
    }
    return arr
}

/**
 * Calculates the text length of a given string and font.
 * @param text the string to get the length of
 * @param font the font being used
 * @returns the length in pixels of the given string
 */
function calculateTextLength(text: string, font: string): number {
    let n = 0
    for(let c of text.split("")) {
        n += c.charCodeAt(0)-32 >= 0 && c.charCodeAt(0)-32 <= 95 ? fonts[font].font[c.charCodeAt(0)-32]!.length/fonts[font].height : fonts[font].font[0]!.length/fonts[font].height
    }
    return n
}

/**
 * Splits text into rows of text with a specified length.
 * @param text the text to split
 * @param max the maximum line length
 * @returns an array of rows of text
 */
export function spliterate(text: string, max: number, font: string): {split: string[], width: number} {
    text = text.replace(/\n/g, "\n ")
    const fullsplit = text.split(" ")
    const split: string[] = []
    let base = 0
    let maxlen = 0
    let prevlen = 0
    let curlen = 0
    for(let i = 0; i <= fullsplit.length; i++) {
        prevlen = curlen
        curlen = calculateTextLength(fullsplit.slice(base, i+1).join(" "), font)
        if(curlen > max || fullsplit[i-1]?.includes("\n")) {
            split.push(fullsplit.slice(base, i).join(" ").replace(/\n/g, ""))
            if(prevlen > maxlen) maxlen = prevlen 
            base = i
        }
    }
    split.push(fullsplit.slice(base, fullsplit.length).join(" "))
    if(curlen > maxlen) maxlen = curlen
    return {split: split, width: maxlen}
}

/**
 * Splits a hex color into its BGR equivalent.
 * @param color the color to split
 * @returns the color split into BGR
 */
function splitColor(color: number): number[] {
    return [(color & 0xFF), (color & 0xFF00) >> 8, (color & 0xFF0000) >> 16]
}

/**
 * Turns text into a 3d array containing the color data for each pixel.
 * @param text the text to write
 * @param maxWidth the maximum width of the image returned
 * @param padding the amount of pixels of padding around the text
 * @param lines the amount of lines per page
 * @param page the page currently on 
 * @param constantWidth a boolean stating whether or not the width of the page is equal to the minimum width needed or maxWidth
 * @param options an object containing the style options for the image
 * @returns a 3d array containing color data for each pixel, used to pass into writeImageData
 */
function writeText(text: string, maxWidth: number, padding: {vertical: number, horizontal: number}, lines: number, page: number, constantWidth: boolean, options: {textColor: number, backgroundColor: number, font: string}): number[][][] {
    text = text.replace(/[^\x00-\x7F]/g, "")
    let {split, width} = spliterate(text, maxWidth-padding.horizontal*2, options.font)
    split = split.slice((page-1)*lines, page*lines > split.length ? undefined : page*lines)
    width += padding.horizontal*2
    if(constantWidth) width = maxWidth
    const height = split.length*fonts[options.font].height + padding.vertical*2
    let img: number[][][] = []
    let lineAt = -1
    for(let i = 0; i < height; i++) {
        img[i] = []
        if(i < padding.vertical || i >= height-padding.vertical) {
            for(let j = 0; j < width; j++) {
                img[i]![j] = splitColor(options.backgroundColor)
            }
            continue
        }
        if((i-padding.vertical)%fonts[options.font].height==0) {
            lineAt++
        }
        let letterOn = -1
        let letter: number[] = []
        let letterBase = padding.horizontal
        for(let j = 0; j < width; j++) {
            if(j < padding.horizontal || j >= width-padding.horizontal) {
                img[i]![j] = splitColor(options.backgroundColor)
                continue
            }
            if(j >= letterBase + letter.length/fonts[options.font].height) {
                letterOn++
                letterBase = j
                let char = split[lineAt]!.charCodeAt(letterOn)-32
                if(Number.isNaN(char) || char < 0 || char >= 95 || char === undefined) char = 0
                letter = fonts[options.font].font[char]!
            }
            const alpha: number = 255 - letter[((i-padding.vertical)-lineAt*fonts[options.font].height)*(letter.length/fonts[options.font].height)+j-letterBase]!
            if(alpha === 0) img[i]![j] = splitColor(options.backgroundColor)
            else {
                const blue = splitColor(options.textColor)[0]! * (alpha / 255.0) + splitColor(options.backgroundColor)[0]! * (1 - alpha / 255.0)
                const green = splitColor(options.textColor)[1]! * (alpha / 255.0) + splitColor(options.backgroundColor)[1]! * (1 - alpha / 255.0)
                const red = splitColor(options.textColor)[2]! * (alpha / 255.0) + splitColor(options.backgroundColor)[2]! * (1 - alpha / 255.0)
                img[i]![j] = [blue, green, red]
            }
        }
    }
    return img
}



export function decodeHTMLEntity(str: string): string {
    return str.replace(/&#(171|187|8220|8221|8222|8243|x0201c|x0201d|x0201e|x00ab|x00bb);/g, "\"")
    .replace(/&#(8216|8217|8218|8242|8249|8250|x2018|x2019|x201a|x02039|x0203a);/g, "\'")
    .replace(/&#732;/g, "~")
    .replace(/&#(160);/g, " ")
    .replace(/&#(8211|8212|x2013|x2014);/g, "-")
    .replace(/&#(\d+);/g, function (match, dec) {
        return String.fromCharCode(dec);
    })
     .replace(/&amp;/g, '&')
     .replace(/&lt;/g, '<')
     .replace(/&gt;/g, '>')
     .replace(/&quot;/g, '\"')
     .replace(/&mdash;/g, '-')
     .replace(/&ndash;/g, '-')
     .replace(/&rsquo;/g, '\'')
     .replace(/&grave;/g, '`')
     .replace(/&apos;/g, '\'')
     .replace(/&quest;/g, '?')
     .replace(/&iquest;/g, '')
     .replace(/&excl;/g, '!')
     .replace(/&num;/g, '#')
     .replace(/&dollar;/g, '$')
     .replace(/&percnt;/g, '%')
     .replace(/&commat;/g, '@')
     .replace(/&ldquo;/g, '"')
     .replace(/&rdquo;/g, '"')
     .replace(/&hellip;/g, '...')
     .replace(/&hearts;/g, '')
}

export function interceptResponse(response: Response, cheerio: any, settings: {textColor: number, backgroundColor: number, font: string, padding: {horizontal: number, vertical: number}}): Response {
    if((response.request.url.includes('ttiparse') || response.request.param?.includes('ttiparse')) && (response.request.url.includes('ttipage') || response.request.param?.includes('ttipage'))) {
        let pageNum = 1
        if(response.request.url.includes('ttipage')) {
            for(let param of response.request.url.split("?")[1]!.split("&")) {
                if(param.includes("ttipage") && !Number.isNaN(parseInt(param.split("=")[1]!))) pageNum = parseInt(param.split("=")[1]!)
            }
        }
        else if(response.request.param?.includes('ttipage')) {
            for(let param of response.request.param!.split("&")) {
                if(param.includes("ttipage") && !Number.isNaN(parseInt(param.split("=")[1]!))) pageNum = parseInt(param.split("=")[1]!)
            }
        }
        const $ = cheerio.load(response.data)
        const arr = $('div.txt > p').toArray()
        const tarr: string[] = []
        for(let i of arr) {
            tarr.push(decodeHTMLEntity($(i).text()))
        }
        let pageText = tarr.join("\n")
        response.rawData = createRawData(writeImageData(writeText(pageText, 800, {vertical: settings.padding.vertical, horizontal: settings.padding.horizontal}, 60, pageNum, true, {textColor: settings.textColor, backgroundColor: settings.backgroundColor, font: settings.font})))
        response.headers['content-type'] = 'image/bmp'
    }
    return response
}
