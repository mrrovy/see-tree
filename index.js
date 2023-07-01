const fs = require("fs");
const path = require("path");
const archy = require("archy");

class CodebaseGraphGenerator {
  constructor(rootPath, ignoreDirs = []) {
    this.rootPath = rootPath;
    this.fileTree = {};
    this.ignoreDirs = [...ignoreDirs]; // Add directories to ignore here
  }

  // This method will build the file tree
  buildTree() {
    this.fileTree = this.buildTreeHelper(this.rootPath);
  }

  buildTreeHelper(filePath) {
    const stats = fs.lstatSync(filePath);
    let node = { label: path.basename(filePath) };

    if (stats.isDirectory()) {
      if (this.ignoreDirs.includes(node.label)) {
        return {}; // Return an empty node object for ignored directories
      }
      const children = fs.readdirSync(filePath);
      node.nodes = children.map((child) => {
        const childPath = path.join(filePath, child);
        return this.buildTreeHelper(childPath);
      });
    }

    return node;
  }

  // This method will generate the visual graph
  generateGraph() {
    const graph = archy(this.fileTree);
    console.log(graph);
  }
}

module.exports = CodebaseGraphGenerator;
