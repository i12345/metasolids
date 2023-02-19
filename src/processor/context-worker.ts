export interface ContextWorker<Context = any> {
    init(context: Context): void
}