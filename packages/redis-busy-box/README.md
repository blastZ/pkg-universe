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

Export keys by pattern

```bash
$ rbb export-keys 'app:user:*'
```

## License

MIT
