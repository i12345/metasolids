import { Processor } from "./processor";

export class ProcessorGraph<Object, ProcessorType extends Processor<Object>> {
    constructor(public processors: ProcessorType[] = []) { }

    process(object: Object): Object {
        
    }
}