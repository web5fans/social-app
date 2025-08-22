import fs from 'node:fs';
import path from 'node:path';
/**
 * 生成ts定义文件
 * @param serviceFolderPath
 * @param dataTypesContent
 */
export default function generateServiceAPITypesFile(serviceFolderPath, userConfig, dataTypesContent) {
    const filePath = path.resolve(serviceFolderPath, `api.d.ts`);
    fs.writeFileSync(filePath, contentTemplate(userConfig.typeNameSpace, dataTypesContent));
}
const contentTemplate = (apiNameSpace, content) => `/**
* ! 文件由脚本生成，不要直接修改
*/
/** */
declare namespace ${apiNameSpace} {
${content}
}`;
