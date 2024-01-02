import { Worker } from "worker_threads";
import * as os from 'os';
import _ = require("lodash");

export class WorkerResolver {
    private workers: Worker[] = [];
    private workersReady: boolean[] = [];
    private taskListeners: any[] = [];

    threadsCount: number = 0;

    constructor(path: string | URL, threadsCount?: number) {
        this.threadsCount = threadsCount || os.cpus().length;
        for (let i = 0; i < this.threadsCount; i++) {
            const worker = new Worker(path);
            this.addListener(worker, i);
            this.workers.push(worker);
            this.workersReady.push(true);
        }
    }

    private registerListener(index: number) {
        return (message: any) => {
            console.log('resolver: onMessage', message.type, message.id, message.data.length);
            const listener = this.taskListeners.find((l) => l.taskId === message.id);

            switch (message.type) {
                case 'success': {
                    if (listener) {
                        listener.resolve(message.data);
                        this.workersReady[index] = true;
                    }
                    break;
                }
                case 'error': {
                    if (listener) {
                        listener.reject(message.data);
                        this.workersReady[index] = true;
                    }
                    break;
                }
                case 'busy': {
                    this.workersReady[index] = false;
                }
            }
        };
    }

    private addListener(worker: Worker, index: number) {
        worker.on('message', this.registerListener(index));
    }

    private addTaskListener(taskId: string, resolve: (value: any) => any, reject: (reason?: any) => any) {
        this.taskListeners.push({ taskId, resolve, reject });
    };

    private async waitWorkerReady(): Promise<number> {
        return new Promise((resolve, reject) => {
            let readyIndex = -1;

            while (true) {
                readyIndex = this.workersReady.indexOf(true);

                if (readyIndex !== -1) {
                    break;
                }
            }

            resolve(readyIndex);
        });
    }

    private getTaskId() {
        return _.uniqueId('task_');
    }

    public callWorkerMethod(fnName: string, data: string) {
        console.log('resolver: callTaskMethod', fnName, data.length);

        const taskId = this.getTaskId();

        return new Promise(async (resolve, reject) => {
            const readyIndex = await this.waitWorkerReady();

            const worker = this.workers[readyIndex];

            this.addTaskListener(taskId, (data) => {
                console.log('resolver: success', taskId, fnName, data.length);
                resolve(data);
            }, (data) => {
                console.log('resolver: error', taskId, fnName, data.length);
                reject(data);
            });

            console.log('resolver: postMessage', taskId, fnName, data.length);
            worker.postMessage({ type: fnName, data, id: taskId });
        });
    }

    public finish() {
        this.workersReady = [];
        this.taskListeners = [];
        for (const worker of this.workers) {
            worker.postMessage({ type: 'exit' });
        }
        this.workers = [];
    }
}