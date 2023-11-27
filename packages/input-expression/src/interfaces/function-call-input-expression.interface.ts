import { FunctionId } from '../enums/function-id.enum.js';
import { FunctionType } from '../enums/function-type.enum.js';
import { InputExpressionType } from '../enums/input-expression-type.enum.js';
import { InputExpression } from './input-expression.interface.js';

export interface FunctionCallInputExpression {
  type: InputExpressionType.FunctionCall;
  function: {
    type: FunctionType;
    id: FunctionId;
  };
  parameters: InputExpression[];
}
