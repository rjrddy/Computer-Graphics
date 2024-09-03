/** 
 * @param {ImageData} bgImg - The background image to be modified.
 * @param {ImageData} fgImg - The foreground image.
 * @param {number} fgOpac - The opacity of the foreground image (0.0 to 1.0).
 * @param {{x: number, y: number}} fgPos - The position of the foreground image in pixels. It can be negative, and (0, 0) means the top-left pixels of the foreground and background are aligned.
 * Skeleton Code provided by Prof. Cem Yuksel. Implementation done by Raj Reddy (Fall 2024).
*/
function composite(bgImg, fgImg, fgOpac, fgPos) {
    
    // Set approriate pos, data, and width/height
    const xPos = fgPos.x;
    const yPos = fgPos.y;
    const fgWidth = fgImg.width;
    const fgHeight = fgImg.height;
    const fgData = fgImg.data;
    const bgData = bgImg.data;

    // Use nested loops to traverse through column and row
    for (let y = 0; y < fgHeight; y++){ 
        for (let x = 0; x < fgWidth; x++) {

            // Store the bg position by adding onto the fg position
            const bgX = x + xPos;
            const bgY = y + yPos;
            
            // Check if the fgPos is negative, not on the bg, or exceeds the bg x and y
            if (bgX >= 0 && bgY >= 0 && bgX < bgImg.width && bgY < bgImg.height) {
                
                // Calculate the index using this formula for both the bg and fg
                const bgIndex = ((bgY * bgImg.width) + bgX) * 4;
                const fgIndex = ((y * fgWidth) + x) * 4;
                
                // checks if the alpha values are greater than 0 so they can be blended
                if (fgData[fgIndex + 3] > 0) {
                    bgData[bgIndex] = (fgOpac * fgData[fgIndex]) + ((1 - fgOpac) * bgData[bgIndex]); // Red
                    bgData[bgIndex + 1] = (fgOpac * fgData[fgIndex + 1]) + ((1 - fgOpac) * bgData[bgIndex + 1]); // Green
                    bgData[bgIndex + 2] = (fgOpac * fgData[fgIndex + 2]) + ((1 - fgOpac) * bgData[bgIndex + 2]); // Blue
                }
            }
        }
    }
   
}
