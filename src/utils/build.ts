
import { XMLBuilder } from "fast-xml-parser";

export const buildXML = (content: Record<string, any>): string => {
    const builder = new XMLBuilder({
        ignoreAttributes: false,
        commentPropName: 'comment',
        // 4 spaces
        indentBy: '    ',
        suppressUnpairedNode: false,
        format: true,
        suppressEmptyNode: true
    });

    return builder.build(content);
}