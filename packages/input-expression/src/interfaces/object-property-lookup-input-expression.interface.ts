import { InputExpressionType } from '../enums/input-expression-type.enum.js';
import { InputExpression } from './input-expression.interface.js';

export interface ObjectPropertyLookupInputExpression {
  type: InputExpressionType.ObjectPropertyLookup;
  object: InputExpression;
  path: InputExpression;
}
