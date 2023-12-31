import * as os from 'os';
type TTask = (...args: any[]) => Promise<void>;

export class ThreadTask {
    taskList: TTask[] = [];
    threads: number;
    
    constructor(threads?: number) {
        this.threads = os.cpus().length;
    }

    addTask(task: TTask) {
        this.taskList.push(task);
    }

    async run() {
        this.threads = Math.min(this.threads, this.taskList.length);

        await Promise.all(Array.from({ length: this.threads }).map(async () => {
            while (this.taskList.length > 0) {
                const task = this.taskList.shift();
                if (task) {
                    await task();
                }
            }
        }));
    }
}