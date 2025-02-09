import { XMLBuilder } from 'fast-xml-parser';

const xmlBuilder: {
    builder: XMLBuilder | null;
    getBuilder(): XMLBuilder;
    build: (content: Record<string, any>) => string;
} = {
    builder: null,
    getBuilder() {
        if (!this.builder) {
            this.builder = new XMLBuilder({
                ignoreAttributes: false,
                commentPropName: 'comment',
                // 4 spaces
                indentBy: '    ',
                suppressUnpairedNode: false,
                format: true,
                suppressEmptyNode: true,
            });
        }

        return this.builder;
    },
    build(content: Record<string, any>) {
        return this.getBuilder().build(content);
    }
};

export const buildXML = (content: Record<string, any>): string => {
    return xmlBuilder.build(content);
};
