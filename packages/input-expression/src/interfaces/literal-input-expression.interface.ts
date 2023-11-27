import { InputExpressionType } from '../enums/input-expression-type.enum.js';

export interface LiteralInputExpression {
  type: InputExpressionType.Literal;
  value: string | number | boolean | null;
}
