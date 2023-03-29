"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createImage = exports.createCanvas = void 0;
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
const image_decode_1 = __importDefault(require("image-decode"));
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-var-requires
const encode = require('image-encode');
class Canvas {
    constructor() {
        this.width = 0;
        this.height = 0;
    }
    setSize(width, height) {
        console.log(`setting size to ${width}, ${height}`);
        this.width = width;
        this.height = height;
        this.data = Buffer.alloc(width * height * 4);
    }
    drawImage(image, sx, sy, sw, sh, dx, dy) {
        if (this.data == undefined)
            return;
        for (let y = 0; y < sh; y++) {
            image.data.copy(this.data, ((dy + y) * this.width + dx) << 2, ((sy + y) * image.width + sx) << 2, ((sy + y) * image.width + sx + sw) << 2);
        }
    }
    encode(format) {
        try {
            return encode(this.data, format, [this.width, this.height]);
        }
        catch (e) {
            // @ts-ignore
            console.log(e.message);
            // @ts-ignore
            console.log(e.stack);
            return new ArrayBuffer(0);
        }
    }
}
class ImageData {
    constructor(width, height, data) {
        this.width = width;
        this.height = height;
        this.data = data;
    }
    static decode(imgData) {
        const { data, width, height } = (0, image_decode_1.default)(imgData);
        return new ImageData(width, height, Buffer.from(data));
    }
}
function createCanvas() {
    return new Canvas();
}
exports.createCanvas = createCanvas;
function createImage(data) {
    return ImageData.decode(data);
}
exports.createImage = createImage;
