import { InputExpressionType } from '../enums/input-expression-type.enum.js';

export interface NodeIdentifierInputExpression {
  type: InputExpressionType.NodeIdentifier;
  nodeType: string;
  nodeId: string;
}
