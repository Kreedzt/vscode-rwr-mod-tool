import { Worker } from "worker_threads";
import * as os from 'os';
import _ = require("lodash");

export class WorkerResolver {
  private workers: Worker[] = [];
  private workersReady: boolean[] = [];

  threadsCount: number = 0;

  constructor(path: string | URL, threadsCount?: number) {
    this.threadsCount = threadsCount || os.cpus().length;
    for (let i = 0; i < this.threadsCount; i++) {
      this.workers.push(new Worker(path));
      this.workersReady.push(true);
    }
  }

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
      this.workersReady[readyIndex] = false;

      const listener = (message: any) => {
        console.log('resolver: onMessage', message.type, message.id, message.data.length);
        switch (message.type) {
          case 'success': {
            if (message.id === taskId) {
              worker.removeListener('message', listener);
              resolve(message.data);
              this.workersReady[readyIndex] = true;
              worker.removeListener('message', listener);
            }
            break;
          }
          case 'error': {
            if (message.id === taskId) {
              reject(message.data);
              this.workersReady[readyIndex] = true;
              worker.removeListener('message', listener);
            }
            break;
          }
          default:
            break;
        }
      };
      worker.on('message', listener);
      console.log('resolver: postMessage', fnName, data.length);
      worker.postMessage({ type: fnName, data, id: taskId });
    });
  }

  public finish() {
    for (const worker of this.workers) {
      worker.postMessage({ type: 'exit' });
    }
  }
}