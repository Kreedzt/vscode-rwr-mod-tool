import type { Uri } from "vscode";

export interface IValidator {
    validate: (fileContent: string, fileUri: Uri) => Promise<void>;
}
