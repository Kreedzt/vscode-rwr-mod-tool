interface IPositionItem {
    line: number;
    character: number;
}

export const getAllPosition = (text: string, target: string): IPositionItem[] => {
    const regex = new RegExp(target, 'g');

    let match;
    const positions: IPositionItem[] = [];
    
    while((match = regex.exec(text)) !== null) {
      positions.push({
        line: text.slice(0, match.index).split('\n').length -1, 
        character: match.index - text.lastIndexOf('\n', match.index) - 1
      });
    }

    return positions;
}