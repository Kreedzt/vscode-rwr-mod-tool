import {
    Subject,
    Subscription,
    debounceTime,
    from,
    switchMap,
    tap,
} from 'rxjs';
import { IValidator } from '../types';
import { Uri } from 'vscode';
import * as vscode from 'vscode';

export class FileScanner {
    filePath2UriMap = new Map<string, Uri>();
    filePath2ContentMap = new Map<string, string>();
    subscription = new Subscription();
    fileChangeSubject = new Subject<string>();
    validatorList: IValidator[] = [];
    validateSubject = new Subject<string>();

    constructor() {
        this.subscription.add(
            this.fileChangeSubject
                .pipe(
                    debounceTime(250),
                    tap((path) => this.logFileChange('file change path', path)),
                    switchMap((path) => {
                        return from(this.scanFile(path));
                    }),
                )
                .subscribe((file) => this.logFileChange('file change', file)),
        );
    }

    logFileChange(message: string, data: any) {
        console.log(message, data);
    }
    addValidator(validator: IValidator) {
        this.validatorList.push(validator);

        return this;
    }

    async validate(fileContent: string, fileUri: Uri) {
        console.log('validating file', fileUri.path);
        await Promise.all(
            this.validatorList.map((v) => v.validate(fileContent, fileUri)),
        );
        this.validateSubject.next(fileUri.path);
        return fileUri.path;
    }

    async scanFile(path: string) {
        console.log('scanning file', path);
        const { fileContent, fileUri } = this.getFileContentAndUri(path);
        if (!fileContent || !fileUri) {
            console.log('file content not found', path);
            return;
        }
        await this.validate(fileContent, fileUri);
    }

    getFileContentAndUri(path: string) {
        const fileContent = this.filePath2ContentMap.get(path);
        const fileUri = this.filePath2UriMap.get(path);
        return { fileContent, fileUri };
    }

    public async addScanFile(uri: Uri, content?: string) {
        let realContent = content;
        if (!realContent) {
            realContent = await this.readFileContent(uri);
        }
        this.filePath2UriMap.set(uri.path, uri);

        console.log('addScanFile', uri.path);
        const lastContent = this.filePath2ContentMap.get(uri.path);
        console.log('lastContent diff', lastContent === realContent);
        if (lastContent === realContent) {
            return;
        }
        this.filePath2ContentMap.set(uri.path, realContent);

        this.fileChangeSubject.next(uri.path);
    }

    async directValidateFile(uri: Uri) {
        const realContent = await this.readFileContent(uri);
        this.filePath2UriMap.set(uri.path, uri);
        this.filePath2ContentMap.set(uri.path, realContent);
        await this.validate(realContent, uri);
    }

    async readFileContent(uri: Uri): Promise<string> {
        const fsContent = await vscode.workspace.fs.readFile(uri);
        return Buffer.from(fsContent).toString();
    }
    destroy() {
        this.subscription.unsubscribe();
    }
}
