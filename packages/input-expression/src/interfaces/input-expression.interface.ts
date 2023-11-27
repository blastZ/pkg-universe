import { ArrayInputExpression } from './array-input-expression.interface.js';
import { FunctionCallInputExpression } from './function-call-input-expression.interface.js';
import { LiteralInputExpression } from './literal-input-expression.interface.js';
import { NodeIdentifierInputExpression } from './node-identifier-input-expression.interface.js';
import { ObjectInputExpression } from './object-input-expression.interface.js';
import { ObjectPropertyLookupInputExpression } from './object-property-lookup-input-expression.interface.js';
import { TemplateInputExpression } from './template-input-expression.interface.js';

export type InputExpression =
  | LiteralInputExpression
  | ObjectInputExpression
  | TemplateInputExpression
  | ObjectPropertyLookupInputExpression
  | NodeIdentifierInputExpression
  | ArrayInputExpression
  | FunctionCallInputExpression;
