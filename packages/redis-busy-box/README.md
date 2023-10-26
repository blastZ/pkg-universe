# Redis Busy Box

Redis busy box to resolve redis problems

## Installation

```bash
npm install -g @blastz/redis-busy-box
```

## Usage

Get memory usage by pattern

```bash
$ rbb memory-usage 'app:user:*'
```

Get count of keys by pattern

```bash
$ rbb count-keys '*'
```

List keys by pattern

```bash
$ rbb list-keys '*' --count 10 --show-values
```

Export keys by pattern

```bash
$ rbb export-keys 'app:user:*'
```

## License

MIT
