export class NotifyError extends Error {
    constructor(message: string, public code: string = "API_ERROR") {
        super(message);
        this.name = 'NotifyError';
    }
}