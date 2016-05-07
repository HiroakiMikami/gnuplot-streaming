# gnuplot-streaming
<!--
[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Dependency Status][daviddm-image]][daviddm-url]
-->
> Visualize stream data by using gnuplot

## Features
1. Can plot stream data from `stdin`
2. Can plot a log file

## Usage
### Install
Install this using [npm](https://www.npmjs.com/) (we assume you have pre-installed [node.js](https://nodejs.org/)),
and install [gnuplot](http://www.gnuplot.info/).

```bash
# 'sudo' may be required in some environments.
npm install -g gnuplot-streaming
```

### Command Line Tool
There are some command line options used in `gnuplot`. `sgnuplot --help` provides information about the options.

#### 1. Plot Stream Data from `stdin`
To plot data from `stdin`, run:

```bash
foo.sh | sgnuplot -
```

Please use `Ctrl-c` to finish `sgnuplot`.

**Example: plot `y=x`**

```bash
foo() {
  for i in {1..20}; do
  echo -e $i"\t"$i
  sleep 0.1
done
}
foo | sgnuplot -
```

#### 2. Plot a Log File
To plot a log file, run:

```bash
sgnuplot bar.log
```

Please use `Ctrl-c` to finish `sgnuplot`.

**Example: plot the file**

```bash
echo 0 0 > bar.log
sgnuplot bar.log &
sleep 5
echo 1 1 >> bar.log
```

### Node.js
TODO

## Environment

I tested this generator only in Linux, but I think that it works in OS X.

## License

MIT © [Mikami Hiroaki]()

<!--

[npm-image]: https://badge.fury.io/js/generator-latex-with-markdown.svg
[npm-url]: https://npmjs.org/package/generator-latex-with-markdown
[travis-image]: https://travis-ci.org/hiroakimikami/generator-latex-with-markdown.svg?branch=master
[travis-url]: https://travis-ci.org/hiroakimikami/generator-latex-with-markdown
[daviddm-image]: https://david-dm.org/hiroakimikami/generator-latex-with-markdown.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/hiroakimikami/generator-latex-with-markdown
-->
