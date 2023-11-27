import { InputExpressionType } from '../enums/input-expression-type.enum.js';
import { InputExpression } from './input-expression.interface.js';

export interface ObjectInputExpression {
  type: InputExpressionType.Object;
  properties: {
    key: InputExpression;
    value: InputExpression;
  }[];
}
