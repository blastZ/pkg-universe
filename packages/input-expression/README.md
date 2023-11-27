# Input Expression

The Input Expression is a library that provides a way to parse and generate expressions.

## Features

- Supports various types of expressions including literals, objects, templates, object property lookups, node identifiers, arrays, and function calls.
- Allows registration of custom node identifiers.
- Provides built-in functions for common operations.

## Installation

```bash
npm install input-expression
```

## Usage

### InputExpressionParser

First, import the `InputExpressionParser` class from the library:

```typescript
import { InputExpressionParser } from 'input-expression';
```

Then, create an instance of the parser:

```typescript
const parser = new InputExpressionParser();
```

You can now use the `parse` method of the parser to parse expressions. The method takes an expression and an optional options object:

```typescript
const result = parser.parse({
  type: InputExpressionType.Object,
  properties: [
    {
      key: {
        type: InputExpressionType.Literal,
        value: 'name',
      },
      value: {
        type: InputExpressionType.Literal,
        value: 'John',
      },
    },
  ],
});

console.log(result); // { name: 'John' }
```

## License

Licensed under MIT
