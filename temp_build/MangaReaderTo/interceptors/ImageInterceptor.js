"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageInterceptor = void 0;
const PoorMansCanvas_1 = require("../PoorMansCanvas");
const shuffle_seed_1 = require("shuffle-seed");
class ImageInterceptor {
    async interceptRequest(request) {
        return request;
    }
    async interceptResponse(response) {
        console.log(`Request status: ${response.status}`);
        if (response.request.url.includes('&shuffle=false')) {
            console.log('Image is not shuffled');
        }
        else if (response.request.url.includes('&shuffle=true')) {
            console.log('response caught');
            const sliceSize = 200;
            const seed = 'stay';
            const byteArray = createByteArray(response.rawData);
            const image = (0, PoorMansCanvas_1.createImage)(byteArray);
            const canvas = (0, PoorMansCanvas_1.createCanvas)();
            canvas.setSize(image.width, image.height);
            const totalParts = Math.ceil(image.width / sliceSize) *
                Math.ceil(image.height / sliceSize);
            // console.log(`totalParts: ${totalParts}`)
            // console.log(`image.width: ${image.width}`)
            // console.log(`image.height: ${image.height}`)
            const noOfHoriSeg = Math.ceil(image.width / sliceSize);
            const someArray = [];
            console.log('Begin someArray loop');
            // for loop to get all slides
            for (let i = 0; i < totalParts; i++) {
                const row = Math.floor(i / noOfHoriSeg);
                const slice = {
                    x: (i - row * noOfHoriSeg) * sliceSize,
                    y: row * sliceSize,
                    width: 0,
                    height: 0,
                };
                slice.width =
                    sliceSize -
                        (slice.x + sliceSize <= image.width
                            ? 0
                            : slice.x + sliceSize - image.width);
                slice.height =
                    sliceSize -
                        (slice.y + sliceSize <= image.height
                            ? 0
                            : slice.y + sliceSize - image.height);
                if (!someArray[slice.width - slice.height]) {
                    someArray[slice.width - slice.height] = [];
                }
                someArray[slice.width - slice.height].push(slice);
            }
            console.log('finished someArray loop');
            // console.log(JSON.stringify(someArray))
            // console.log(`Some Array Length: ${someArray[0]!.length}`)
            console.log('Begin drawing loop');
            for (const property in someArray) {
                const baseRangeArray = this.baseRange(0, 
                // @ts-ignore: Object is possibly 'null'.
                someArray[property]?.length, 1, false);
                const shuffleInd = (0, shuffle_seed_1.unshuffle)(baseRangeArray, seed);
                // console.log(JSON.stringify(shuffleInd))
                // @ts-ignore: Object is possibly 'null'.
                const groups = this.getGroup(someArray[property]);
                // console.log(JSON.stringify(groups))
                // @ts-ignore: Object is possibly 'null'.
                for (const [key, slice] of someArray[property].entries()) {
                    const s = shuffleInd[key];
                    const row = Math.floor(s / groups.cols);
                    const col = s - row * groups.cols;
                    const x = col * slice.width;
                    const y = row * slice.height;
                    canvas.drawImage(image, groups.x + x, groups.y + y, slice.width, slice.height, slice.x, slice.y);
                }
            }
            console.log('finished drawing loop');
            const encodedImg = canvas.encode('jpg');
            response.rawData = createRawData(Buffer.from(encodedImg));
            console.log('Completed without errors');
        }
        return response;
    }
    // @ts-ignore
    getColsInGroup(slices) {
        if (slices.length == 1)
            return 1;
        let t = 'init';
        for (var i = 0; i < slices.length; i++) {
            if (t == 'init')
                t = slices[i].y;
            if (t != slices[i].y) {
                return i;
            }
        }
        return i;
    }
    // @ts-ignore
    getGroup(slices) {
        const group = {
            slices: slices.length,
            cols: this.getColsInGroup(slices),
            rows: 0,
            x: slices[0].x,
            y: slices[0].y,
        };
        group.rows = slices.length / group.cols;
        return group;
    }
    // https://github.com/lodash/lodash
    baseRange(start, end, step, fromRight) {
        let index = -1;
        let length = Math.max(Math.ceil((end - start) / (step || 1)), 0);
        const result = new Array(length);
        while (length--) {
            result[fromRight ? length : ++index] = start;
            start += step;
        }
        return result;
    }
}
exports.ImageInterceptor = ImageInterceptor;
