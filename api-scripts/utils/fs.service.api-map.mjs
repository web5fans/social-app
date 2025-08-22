import fs from 'node:fs';
import path from 'node:path';
export default function generateServiceAPIMapFile(serviceFolderPath, pathDefines) {
    const filePath = path.resolve(serviceFolderPath, `apiMap.ts`);
    fs.writeFileSync(filePath, fileTemplate(pathDefines.join(',\n')));
}
const fileTemplate = (content) => `/**
* ! 文件由脚本生成，不要直接修改
*/
import defineAPI from "./defineAPI";

const apiMap = {
${content}
}
export default apiMap;
export type APIMap = typeof apiMap;
export type APIPaths = keyof APIMap;
`;
