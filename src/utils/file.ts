import * as prettier from 'prettier';
interface IPositionItem {
    line: number;
    character: number;
}

export const getAllPosition = (
    text: string,
    target: string,
): IPositionItem[] => {
    const regex = new RegExp(target, 'g');

    let match;
    const positions: IPositionItem[] = [];

    while ((match = regex.exec(text)) !== null) {
        positions.push({
            line: text.slice(0, match.index).split('\n').length - 1,
            character: match.index - text.lastIndexOf('\n', match.index) - 1,
        });
    }

    return positions;
};

const prettierConfig: prettier.Options = {
    semi: false,
    printWidth: 80,
    singleQuote: false,
    tabWidth: 4,
    useTabs: false,
    parser: 'xml',
    plugins: [require.resolve('@prettier/plugin-xml')],
};

export const checkXmlFormatted = async (text: string): Promise<boolean> => {
    return prettier.check(text, prettierConfig);
};

export const formatXml = async (text: string): Promise<string> => {
    return prettier.format(text, prettierConfig);
};