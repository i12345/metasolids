export type GeneratorType<GeneratorT extends Generator> =
    GeneratorT extends Generator<infer T> ? T : never