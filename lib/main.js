'use strict';

const os = require('os');
const fs = require('fs');
const process = require('process');
const readline = require('readline');
const run = require('comandante');

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
    gnuplot.write(`${finalizeScript}\nquit\n`);
    fs.unlinkSync(tmpfile);
  });
}

module.exports = {
  plotStream: plotStream,
  plotFile(filename, options) {
    plotStream(fs.createReadStream(filename), options);
  },
  plotStdin(usesSplot, options) {
    plotStream(process.stdin, options);
  }
}
