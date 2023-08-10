
import { XMLParser } from "fast-xml-parser";

export const parseXML = (content: string) => {
    const parser = new XMLParser({
        parseAttributeValue: true,
        ignoreAttributes: false,
        allowBooleanAttributes: true,
        commentPropName: 'comment'
    });

    return parser.parse(content);
}