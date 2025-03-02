import { XMLParser } from 'fast-xml-parser';

const xmlParser: {
    parser: XMLParser | null;
    getParser(): XMLParser;
    parse: (content: string) => Record<string, any>;
} = {
    parser: null,
    getParser() {
        if (!this.parser) {
            this.parser = new XMLParser({
                parseAttributeValue: true,
                ignoreAttributes: false,
                allowBooleanAttributes: true,
                parseTagValue: true,
                commentPropName: 'comment',
                numberParseOptions: {
                    hex: true,
                    leadingZeros: false,
                    eNotation: true,
                },
            });
        }

        return this.parser;
    },
    parse(content: string) {
        return this.getParser().parse(content);
    }
};

export const parseXML = (content: string) => {
    return xmlParser.parse(content);
};
