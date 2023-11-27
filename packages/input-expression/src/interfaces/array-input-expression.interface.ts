import { InputExpressionType } from '../enums/input-expression-type.enum.js';
import { InputExpression } from './input-expression.interface.js';

export interface ArrayInputExpression {
  type: InputExpressionType.Array;
  elements: InputExpression[];
}
