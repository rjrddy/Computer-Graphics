/** 
 * @param {ImageData} bgImg - The background image to be modified.
 * @param {ImageData} fgImg - The foreground image.
 * @param {number} fgOpac - The opacity of the foreground image (0.0 to 1.0).
 * @param {{x: number, y: number}} fgPos - The position of the foreground image in pixels. It can be negative, and (0, 0) means the top-left pixels of the foreground and background are aligned.
 * Skeleton Code provided by Prof. Cem Yuksel. Implementation done by Raj Reddy (Fall 2024).
*/
function composite(bgImg, fgImg, fgOpac, fgPos) {
    
    const { width: bgWidth, height: bgHeight, data: bgData } = bgImg;
    const { width: fgWidth, height: fgHeight, data: fgData } = fgImg;
    const { x: fgX, y: fgY } = fgPos;

    for (let y = 0; y < fgHeight; y++) {
        for (let x = 0; x < fgWidth; x++) {
            const bgX = x + fgX;
            const bgY = y + fgY;

            // check if the pixel is within the bounds of the background image
            if (bgX >= 0 && bgX < bgWidth && bgY >= 0 && bgY < bgHeight) {
                const fgIndex = (y * fgWidth + x) * 4;
                const bgIndex = (bgY * bgWidth + bgX) * 4;

                const bgAlpha = bgData[bgIndex + 3] / 255;
                const fgAlpha = (fgData[fgIndex + 3] / 255) * fgOpac;

                // blend the alpha values
                const blendedAlpha = fgAlpha + bgAlpha * (1 - fgAlpha);

                if (fgData[fgIndex + 3] > 0) {
                    // alpha blending for each color channel (Red, Green, Blue)
                    bgData[bgIndex] = (fgAlpha * fgData[fgIndex] + bgAlpha * bgData[bgIndex] * (1 - fgAlpha)) / blendedAlpha;
                    bgData[bgIndex + 1] = (fgAlpha * fgData[fgIndex + 1] + bgAlpha * bgData[bgIndex + 1] * (1 - fgAlpha)) / blendedAlpha;
                    bgData[bgIndex + 2] = (fgAlpha * fgData[fgIndex + 2] + bgAlpha * bgData[bgIndex + 2] * (1 - fgAlpha)) / blendedAlpha;

                    // update the alpha channel
                    bgData[bgIndex + 3] = blendedAlpha * 255;
                }
            }
        }
    }
}
