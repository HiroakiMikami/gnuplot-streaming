'use strict';

const os = require('os');
const fs = require('fs');
const process = require('process');
const readline = require('readline');
const run = require('comandante');

function plotStream(stream, usesSplot, plotOptions, initializeScript, finalizeScript) {
  const tmpfile = `${os.tmpdir()}/gnuplot-streaming.${process.pid}`

  const plotCommand = (usesSplot) ? "splot" : "plot";
  const gnuplot = run('gnuplot', []);

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
    fs.appendFileSync(tmpfile, `${line}\n`);
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
  plotFile(filename, usesSplot, plotOptions, initializeScript, finalizeScript) {
    plotStream(fs.createReadStream(filename), usesSplot, plotOptions, initializeScript, finalizeScript);
  },
  plotStdin(usesSplot, plotOptions, initializeScript, finalizeScript) {
    plotStream(process.stdin, usesSplot, plotOptions, initializeScript, finalizeScript);
  }
}
