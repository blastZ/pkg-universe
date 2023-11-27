import { InputExpressionType } from '../enums/input-expression-type.enum.js';
import { InputExpression } from './input-expression.interface.js';

export interface TemplateInputExpression {
  type: InputExpressionType.Template;
  elements: InputExpression[];
}
