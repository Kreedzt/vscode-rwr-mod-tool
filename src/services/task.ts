export class TaskService {
    static inst: null | TaskService = null;

    ready = true;

    static self() {
        if (TaskService.inst === null) {
            TaskService.inst = new TaskService();
        }

        return TaskService.inst;
    }

    getReady() {
        return this.ready;
    }

    pause() {
        this.ready = false;
    }

    resume() {
        this.ready = true;
    }
}