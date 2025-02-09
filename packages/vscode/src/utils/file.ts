import * as prettier from 'prettier';
interface IPositionItem {
    line: number;
    character: number;
}

export const getAllPosition = (
    text: string,
  target: string,
): IPositionItem[] => {
  // Escape special regex characters in target
  const escapedTarget = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escapedTarget, 'g');

  let match;
  const positions: IPositionItem[] = [];

  while ((match = regex.exec(text)) !== null) {
    const lines = text.substring(0, match.index).split('\n');
    positions.push({
      line: lines.length - 1,
      character: lines[lines.length - 1].length,
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
