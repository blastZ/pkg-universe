import { FunctionId } from '../src/enums/function-id.enum.js';
import { FunctionType } from '../src/enums/function-type.enum.js';
import {
  InputExpression,
  InputExpressionParser,
  InputExpressionType,
} from '../src/index.js';

const parser = new InputExpressionParser();

describe('Input expression parser', () => {
  it('should work with Literal, Object', () => {
    const expression: InputExpression = {
      type: InputExpressionType.Object,
      properties: [
        {
          key: {
            type: InputExpressionType.Literal,
            value: 'stringLiteral',
          },
          value: {
            type: InputExpressionType.Literal,
            value: 'a',
          },
        },
        {
          key: {
            type: InputExpressionType.Literal,
            value: 'numberLiteral',
          },
          value: {
            type: InputExpressionType.Literal,
            value: 1,
          },
        },
        {
          key: {
            type: InputExpressionType.Literal,
            value: 'booleanLiteral',
          },
          value: {
            type: InputExpressionType.Literal,
            value: true,
          },
        },
        {
          key: {
            type: InputExpressionType.Literal,
            value: 'nullLiteral',
          },
          value: {
            type: InputExpressionType.Literal,
            value: null,
          },
        },
      ],
    };

    const result = parser.parse(expression);

    expect(result).toEqual({
      stringLiteral: 'a',
      numberLiteral: 1,
      booleanLiteral: true,
      nullLiteral: null,
    });
  });

  it('should work with Template, ObjectPropertyLookup, NodeIdentifier, Array', () => {
    parser.registerNodeIdentifier('trigger', (nodeId, options) => {
      if (!options.data) {
        return undefined;
      }

      return options.data.triggerDataById[nodeId];
    });

    const expression: InputExpression = {
      type: InputExpressionType.Template,
      elements: [
        {
          type: InputExpressionType.ObjectPropertyLookup,
          object: {
            type: InputExpressionType.NodeIdentifier,
            nodeId: 'trgbKaUWJWmPnP3S5',
            nodeType: 'trigger',
          },
          path: {
            type: InputExpressionType.Array,
            elements: [
              {
                type: InputExpressionType.Literal,
                value: 'meta',
              },
              {
                type: InputExpressionType.Literal,
                value: 'name',
              },
            ],
          },
        },
        {
          type: InputExpressionType.Literal,
          value: '',
        },
      ],
    };

    const result = parser.parse(expression, {
      data: {
        triggerDataById: {
          trgbKaUWJWmPnP3S5: {
            id: 'trgbKaUWJWmPnP3S5',
            meta: { name: 'trigger-01' },
          },
        },
      },
    });

    expect(result).toEqual('trigger-01');
  });

  it('should work with FunctionCall', () => {
    const expression: InputExpression = {
      type: InputExpressionType.Object,
      properties: [
        {
          key: {
            type: InputExpressionType.Literal,
            value: 'trim',
          },
          value: {
            type: InputExpressionType.FunctionCall,
            function: {
              type: FunctionType.FunctionReference,
              id: FunctionId.Trim,
            },
            parameters: [
              {
                type: InputExpressionType.Literal,
                value: ' a ',
              },
            ],
          },
        },
        {
          key: {
            type: InputExpressionType.Literal,
            value: 'lowercase',
          },
          value: {
            type: InputExpressionType.FunctionCall,
            function: {
              type: FunctionType.FunctionReference,
              id: FunctionId.Lowercase,
            },
            parameters: [
              {
                type: InputExpressionType.Literal,
                value: 'ABC DEF',
              },
            ],
          },
        },
        {
          key: {
            type: InputExpressionType.Literal,
            value: 'uppercase',
          },
          value: {
            type: InputExpressionType.FunctionCall,
            function: {
              type: FunctionType.FunctionReference,
              id: FunctionId.Uppercase,
            },
            parameters: [
              {
                type: InputExpressionType.Literal,
                value: 'abc def',
              },
            ],
          },
        },
        {
          key: {
            type: InputExpressionType.Literal,
            value: 'length',
          },
          value: {
            type: InputExpressionType.FunctionCall,
            function: {
              type: FunctionType.FunctionReference,
              id: FunctionId.Length,
            },
            parameters: [
              {
                type: InputExpressionType.Literal,
                value: 'abc def',
              },
            ],
          },
        },
        {
          key: {
            type: InputExpressionType.Literal,
            value: 'capitalize',
          },
          value: {
            type: InputExpressionType.FunctionCall,
            function: {
              type: FunctionType.FunctionReference,
              id: FunctionId.Capitalize,
            },
            parameters: [
              {
                type: InputExpressionType.Literal,
                value: 'abc def',
              },
            ],
          },
        },
      ],
    };

    const result = parser.parse(expression);

    expect(result).toEqual({
      trim: 'a',
      lowercase: 'abc def',
      uppercase: 'ABC DEF',
      length: 7,
      capitalize: 'Abc Def',
    });
  });
});
