/**
 * Compress an image file to a maximum size
 * Uses Canvas API to resize and compress images
 */

const MAX_SIZE_KB = 500;
const MAX_SIZE_BYTES = MAX_SIZE_KB * 1024;

export async function compressImage(file: File, maxSizeKB: number = MAX_SIZE_KB): Promise<File> {
    // If file is already small enough, return as is
    if (file.size <= maxSizeKB * 1024) {
        return file;
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                // Calculate new dimensions
                let { width, height } = img;
                const maxDimension = 1920; // Max width/height

                // Scale down if image is too large
                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = (height / width) * maxDimension;
                        width = maxDimension;
                    } else {
                        width = (width / height) * maxDimension;
                        height = maxDimension;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                // Draw image on canvas
                ctx.drawImage(img, 0, 0, width, height);

                // Try different quality levels to get under max size
                let quality = 0.9;
                let compressedDataUrl: string;

                const tryCompress = () => {
                    compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                    const base64Size = (compressedDataUrl.length * 3) / 4 -
                        (compressedDataUrl.endsWith('==') ? 2 : compressedDataUrl.endsWith('=') ? 1 : 0);

                    if (base64Size > maxSizeKB * 1024 && quality > 0.1) {
                        quality -= 0.1;

                        // Also reduce dimensions if quality is getting too low
                        if (quality <= 0.5) {
                            width *= 0.9;
                            height *= 0.9;
                            canvas.width = width;
                            canvas.height = height;
                            ctx.drawImage(img, 0, 0, width, height);
                        }

                        tryCompress();
                    } else {
                        // Convert data URL to File
                        fetch(compressedDataUrl)
                            .then(res => res.blob())
                            .then(blob => {
                                const compressedFile = new File(
                                    [blob],
                                    file.name.replace(/\.[^.]+$/, '.jpg'),
                                    { type: 'image/jpeg' }
                                );
                                console.log(`Image compressed: ${(file.size / 1024).toFixed(1)}KB -> ${(compressedFile.size / 1024).toFixed(1)}KB`);
                                resolve(compressedFile);
                            })
                            .catch(reject);
                    }
                };

                tryCompress();
            };

            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };
    });
}

/**
 * Compress multiple images
 */
export async function compressImages(files: File[], maxSizeKB: number = MAX_SIZE_KB): Promise<File[]> {
    return Promise.all(files.map(file => compressImage(file, maxSizeKB)));
}
