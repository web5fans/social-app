import fs from 'node:fs';
import path from 'node:path';
/**
 * 生成 service/enums.ts 文件
 */
export default function generateServiceEnumsFile(serviceFolderPath, enumsContent) {
    if (!enumsContent)
        return;
    const filePath = path.resolve(serviceFolderPath, `enums.ts`);
    fs.writeFileSync(filePath, contentTemplate(enumsContent));
}
const contentTemplate = (content) => `/**
* ! 文件由脚本生成，不要直接修改
*/
/** */
${content}
`;
