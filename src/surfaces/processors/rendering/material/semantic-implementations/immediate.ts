import { MaterialSemanticImplementation } from "../implementation.js";

export interface MaterialSemanticImplementation_Immediate
    extends MaterialSemanticImplementation {
    equals(that: MaterialSemanticImplementation_Immediate): boolean
}