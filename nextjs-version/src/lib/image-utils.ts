export async function compressAndFormatImage(
    file: File,
    targetAspectRatio: number | null = null, // e.g., 16/9. If null, no cropping is done
    maxWidthOrHeight: number = 1920,
    quality: number = 0.8
): Promise<File> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (event) => {
            const img = new Image()
            img.src = event.target?.result as string
            img.onload = () => {
                let sourceX = 0
                let sourceY = 0
                let sourceWidth = img.width
                let sourceHeight = img.height

                // 1. Crop logic (if an aspect ratio is provided)
                if (targetAspectRatio) {
                    const imageRatio = sourceWidth / sourceHeight
                    if (imageRatio > targetAspectRatio) {
                        // Image is wider than target ratio, so crop the sides horizontally
                        sourceWidth = sourceHeight * targetAspectRatio
                        sourceX = (img.width - sourceWidth) / 2
                    } else if (imageRatio < targetAspectRatio) {
                        // Image is taller than target ratio, so crop top/bottom vertically
                        sourceHeight = sourceWidth / targetAspectRatio
                        sourceY = (img.height - sourceHeight) / 2
                    }
                }

                // 2. Compress logic (scale down to max version)
                let destWidth = sourceWidth
                let destHeight = sourceHeight

                if (destWidth > maxWidthOrHeight || destHeight > maxWidthOrHeight) {
                    if (destWidth > destHeight) {
                        destWidth = maxWidthOrHeight
                        destHeight = (sourceHeight * maxWidthOrHeight) / sourceWidth
                    } else {
                        destHeight = maxWidthOrHeight
                        destWidth = (sourceWidth * maxWidthOrHeight) / sourceHeight
                    }
                }

                // 3. Draw to canvas
                const canvas = document.createElement("canvas")
                canvas.width = destWidth
                canvas.height = destHeight

                const ctx = canvas.getContext("2d")
                if (!ctx) {
                    reject(new Error("Failed to get canvas context"))
                    return
                }

                // Fill background with white (handling transparent PNGs converted to JPEG)
                ctx.fillStyle = "#FFFFFF"
                ctx.fillRect(0, 0, destWidth, destHeight)

                ctx.drawImage(
                    img,
                    sourceX, sourceY, sourceWidth, sourceHeight, // Read crop source
                    0, 0, destWidth, destHeight                  // Draw destination size
                )

                // 4. Return the compressed JPEG Blob as a new File
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error("Canvas format failed"))
                            return
                        }
                        // Ensure filename is .jpg since we convert it
                        const newName = file.name.replace(/\.[^/.]+$/, "") + ".jpg"
                        const compressedFile = new File([blob], newName, {
                            type: "image/jpeg",
                            lastModified: Date.now(),
                        })
                        resolve(compressedFile)
                    },
                    "image/jpeg",
                    quality
                )
            }
            img.onerror = () => reject(new Error("Rasm yuklanishida xatolik"))
        }
        reader.onerror = () => reject(new Error("Rasm o'qishda xatolik"))
    })
}
