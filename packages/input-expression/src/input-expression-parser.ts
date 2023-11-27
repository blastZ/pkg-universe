import { BuiltInFunctions } from './built-in-functions.js';
import { FunctionId } from './enums/function-id.enum.js';
import { InputExpressionType } from './enums/input-expression-type.enum.js';
import { ArrayInputExpression } from './interfaces/array-input-expression.interface.js';
import { FunctionCallInputExpression } from './interfaces/function-call-input-expression.interface.js';
import { InputExpression } from './interfaces/input-expression.interface.js';
import { LiteralInputExpression } from './interfaces/literal-input-expression.interface.js';
import { NodeIdentifierInputExpression } from './interfaces/node-identifier-input-expression.interface.js';
import { ObjectInputExpression } from './interfaces/object-input-expression.interface.js';
import { ObjectPropertyLookupInputExpression } from './interfaces/object-property-lookup-input-expression.interface.js';
import { TemplateInputExpression } from './interfaces/template-input-expression.interface.js';
import { convertToString } from './utils/convert-to-string.util.js';

export interface ParseOptions {
  data?: Record<string, any>;
}

export type NodeIdentifier = (nodeId: string, options: ParseOptions) => any;

export class InputExpressionParser {
  private data: Record<string, any> = {};
  private nodeIdentifierByNodeType: {
    [nodeType: string]: NodeIdentifier;
  } = {};

  registerNodeIdentifier(nodeType: string, nodeIdentifier: NodeIdentifier) {
    if (this.nodeIdentifierByNodeType[nodeType]) {
      console.warn(
        `Node identifier for node type "${nodeType}" is already registered, it will be overwritten.`,
      );
    }

    this.nodeIdentifierByNodeType[nodeType] = nodeIdentifier;

    return this;
  }

  private parseLiteral(expression: LiteralInputExpression) {
    return expression.value;
  }

  private parseObject(
    expression: ObjectInputExpression,
    options: ParseOptions,
  ) {
    const { properties } = expression;

    return properties.reduce((result, current) => {
      const key = this.parse(current.key, options);
      const value = this.parse(current.value, options);

      result[key] = value;

      return result;
    }, {} as any);
  }

  private parseTemplate(
    expression: TemplateInputExpression,
    options: ParseOptions,
  ) {
    const { elements } = expression;

    return elements.reduce((result, current) => {
      const data: any = this.parse(current, options);

      const str = convertToString(data);

      return result + str;
    }, '');
  }

  private parseObjectPropertyLookup(
    expression: ObjectPropertyLookupInputExpression,
    options: ParseOptions,
  ) {
    const { object, path } = expression;

    const obj: any = this.parse(object, options);
    const pathArray: string[] = this.parse(path, options);

    let result = obj;
    for (const key of pathArray) {
      result = result?.[key];

      if (result === undefined) {
        return result;
      }
    }

    return result;
  }

  private parseNodeIdentifier(
    expression: NodeIdentifierInputExpression,
    options: ParseOptions,
  ) {
    const { nodeType, nodeId } = expression;

    return this.nodeIdentifierByNodeType[nodeType]?.(nodeId, options);
  }

  private parseArray(
    expression: ArrayInputExpression,
    options: ParseOptions,
  ): any[] {
    return expression.elements.map((o) => this.parse(o, options));
  }

  private parseFunctionCall(
    expression: FunctionCallInputExpression,
    options: ParseOptions,
  ) {
    const { function: func, type, parameters } = expression;

    const params: any[] = parameters.map((parameterInputExpression) =>
      this.parse(parameterInputExpression, options),
    );

    if (func.id === FunctionId.Trim) {
      return BuiltInFunctions.trim(params[0]);
    }

    if (func.id === FunctionId.Lowercase) {
      return BuiltInFunctions.lowercase(params[0]);
    }

    if (func.id === FunctionId.Uppercase) {
      return BuiltInFunctions.uppercase(params[0]);
    }

    if (func.id === FunctionId.Length) {
      return BuiltInFunctions.length(params[0]);
    }

    if (func.id === FunctionId.Capitalize) {
      return BuiltInFunctions.capitalize(params[0]);
    }

    throw new Error('ERR_INVALID_FUNCTION_ID');
  }

  parse(expression: InputExpression, options: ParseOptions = {}) {
    if (expression.type === InputExpressionType.Literal) {
      return this.parseLiteral(expression);
    }

    if (expression.type === InputExpressionType.Object) {
      return this.parseObject(expression, options);
    }

    if (expression.type === InputExpressionType.Template) {
      return this.parseTemplate(expression, options);
    }

    if (expression.type === InputExpressionType.ObjectPropertyLookup) {
      return this.parseObjectPropertyLookup(expression, options);
    }

    if (expression.type === InputExpressionType.NodeIdentifier) {
      return this.parseNodeIdentifier(expression, options);
    }

    if (expression.type === InputExpressionType.Array) {
      return this.parseArray(expression, options);
    }

    if (expression.type === InputExpressionType.FunctionCall) {
      return this.parseFunctionCall(expression, options);
    }

    throw new Error('ERR_INVALID_EXPRESSION_TYPE');
  }
}
