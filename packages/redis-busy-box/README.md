# Redis Busy Box

Redis busy box to resolve redis problems

## Installation

```bash
npm install -g @blastz/redis-busy-box
```

## Usage

Get memory usage by pattern

```bash
$ rbb memory-usage '*'
Memory usage: 6317 bytes / 6 kb / 0 mb / 0 gb
```

Get count of keys by pattern

```bash
$ rbb count-keys '*'
Count of keys: 14
```

List keys by pattern

```bash
$ rbb list-keys '*' --count 10 --show-values
{ key: 'test:list', type: 'list', value: [ 'a', 'c', 'b', 'a' ] }
{ key: 'test:string', type: 'string', value: 'a' }
{ key: 'test:set', type: 'set', value: [ 'a', 'b', 'c' ] }
? Continue? (Y/n)
```

Export keys by pattern

```bash
$ rbb export-keys 'app:user:*'
```

Delete keys by pattern

```bash
$ rbb delete-keys '*' --count 10 --show-values
{
  key: 'test:zset',
  type: 'zset',
  value: [ 'b', '8', 'a', '10', 'c', '12' ]
}
{
  key: 'test:stream',
  type: 'stream',
  value: [
    [ '1698301369557-0', [ 'name', 'a', 'age', '12' ] ],
    [ '1698301390773-0', [ 'name', 'b', 'age', '14' ] ]
  ]
}
{ key: 'test:hash', type: 'hash', value: { name: 'a', age: '12' } }
? Delete above keys? (y/N)
```

## License

MIT
