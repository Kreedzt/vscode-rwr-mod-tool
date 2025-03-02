import {
    Observable,
    Subject,
    Subscription,
    debounceTime,
    distinctUntilChanged,
    from,
    map,
    mergeMap,
    shareReplay,
    tap,
} from 'rxjs';
import { IValidator } from '../types';
import { Uri } from 'vscode';
import * as vscode from 'vscode';

interface FileData {
    uri: Uri;
    content: string;
}

export class FileScanner {
    private subscription = new Subscription();
    private fileSubject = new Subject<FileData>();
    private validatorList: IValidator[] = [];
    private validateSubject = new Subject<string>();

    // Share the file stream for multiple subscribers
    private fileStream$ = this.fileSubject.pipe(
        distinctUntilChanged((prev, curr) => prev.content === curr.content),
        debounceTime(250),
        tap(({ uri }) => this.logFileChange('Processing file', uri.path)),
        mergeMap(file => this.validateFile(file)),
        shareReplay(1)
    );

    constructor() {
        // Subscribe to file processing stream
        this.subscription.add(
            this.fileStream$.subscribe(path => 
                this.logFileChange('Completed processing', path)
            )
        );
    }

    private logFileChange(message: string, data: any) {
        console.log(message, data);
    }

    addValidator(validator: IValidator) {
        this.validatorList.push(validator);
        return this;
    }

    private validateFile(file: FileData): Observable<string> {
        return from(Promise.all(
            this.validatorList.map(v => v.validate(file.content, file.uri))
        )).pipe(
            tap(() => this.validateSubject.next(file.uri.path)),
            map(() => file.uri.path)
        );
    }

    public async addScanFile(uri: Uri, content?: string) {
        const fileContent = content ?? await this.readFileContent(uri);
        this.fileSubject.next({
            uri,
            content: fileContent
        });
    }

    public async directValidateFile(uri: Uri) {
        try {
            if (!uri || !uri.fsPath) {
                console.error('Invalid URI provided to directValidateFile:', uri);
                return;
            }
            const content = await this.readFileContent(uri);
            return this.validateFile({ uri, content }).toPromise();
        } catch (error) {
            console.error(`Error in directValidateFile for ${uri?.fsPath}:`, error);
            throw error;
        }
    }

    private async readFileContent(uri: Uri): Promise<string> {
        if (!uri || !uri.fsPath) {
            throw new Error('Invalid URI provided to readFileContent');
        }
        try {
            const fsContent = await vscode.workspace.fs.readFile(uri);
            return Buffer.from(fsContent).toString();
        } catch (error) {
            console.error(`Error reading file ${uri.fsPath}:`, error);
            throw error;
        }
    }

    destroy() {
        this.subscription.unsubscribe();
    }
}
