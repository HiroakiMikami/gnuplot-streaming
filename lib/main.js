'use strict';

const os = require('os');
const fs = require('fs');
const process = require('process');
const readline = require('readline');
const Transform = require('stream').Transform;
const util = require('util');
const Promise = require('bluebird');
const run = require('comandante');

// Create a custom read stream
function createReadStream(path) {
  class Stream {
    constructor(path) {
      Transform.call(this, {});

      this.contentLength = 0;
      this.buff = '';

      new Promise((resolve, reject) => {
        // Initialize this.buff
        fs.access(path, (err) => {
          if (err) {
            resolve();
            return ;
          }

          fs.readFile(path, 'utf8', (err, content) => {
            if (err) {
              reject();
              return ;
            }

            this.write(content);
            this.contentLength = content.length;
            resolve();
          });
        });
      }).then(() => {
        // Watch the file
        this.watcher = fs.watch(path, (event, filename) => {
          // Update this.buff
          const content = fs.readFileSync(path, 'utf8');
          this.write(content.substring(this.contentLength));
          this.contentLength = content.length;
        });
      });
    }
    _transform(chunk, encoding, callback) {
      this.push(chunk);
      callback();
    }
    finish() {
      if (this.watcher) this.watcher.close();
    }
  }
  // TODO `extends Transform` does not work.
  util.inherits(Stream, Transform);

  return new Stream(path);
}

function plotStream(stream, options) {
  // Read the options
  const dataNum = options.dataNum || null;
  const usesSplot = options.usesSplot || false;
  const gnuplotOptions = options.gnuplotOptions || [];
  const plotOptions = options.plotOptions || "";
  const initializeScript = options.initializeScript || "";
  const finalizeScript = options.finalizeScript || "";

  const tmpfile = `${os.tmpdir()}/gnuplot-streaming.${process.pid}`

  const plotCommand = (usesSplot) ? "splot" : "plot";

  const data = [];

  // Run gnuplot command
  const gnuplot = run('gnuplot', gnuplotOptions);
  // Initialize gnuplot
  gnuplot.write(`${initializeScript}\n`);
  // Open a window
  gnuplot.write(`${plotCommand} '${tmpfile}' ${plotOptions}\n`);

  const reader = readline.createInterface({
    input: stream,
    output: null,
    terminal: false
  });
  reader.on('line', (line) => {
    if (dataNum == null || dataNum <= 0) {
      fs.appendFileSync(tmpfile, `${line}\n`);
    } else {
      // Remove the previous data
      data.push(line);
      while (data.length > dataNum) {
        data.shift(); // Remove the oldest line
      }
      fs.writeFileSync(tmpfile, data.join('\n'));
    }
    // Update the plot
    gnuplot.write(`${plotCommand} '${tmpfile}' ${plotOptions}\n`);
  });
  reader.on('close', () => {
    // Finalize gnuplot
    gnuplot.write(`${finalizeScript}\n`);
  });

  return {
    close() {
      // Ignore the error in gnuplot
      gnuplot.on('error', (err) => {});

      // Finish gnuplot
      fs.access(tmpfile, (err) => {
        if (!err) fs.unlinkSync(tmpfile);
      });

      stream.end();
      // Finish the stream if it is the custom stream defined above
      if (stream.finish) stream.finish();

      gnuplot.write('quit\n');
    }
  }
}

module.exports = {
  plotStream: plotStream,
  plotFile(filename, options) {
    return plotStream(createReadStream(filename), options);
  },
  plotStdin(options) {
    return plotStream(process.stdin, options);
  }
}
