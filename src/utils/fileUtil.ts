import fs from 'node:fs';
import path from 'node:path'

/**将data写入relativePath文件 */
export const createAndWriteFile = (relativePath: string, data: string) => {
    const absolutePath = path.resolve(relativePath);
    const dirPath = path.dirname(absolutePath)
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
    }
    fs.writeFileSync(absolutePath, data);
}