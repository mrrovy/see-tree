const fs = require("fs");
const path = require("path");
const archy = require("archy");
const chalk = require("chalk");

class CodebaseGraphGenerator {
  constructor(rootPath, ignoreDirs = []) {
    this.rootPath = rootPath;
    this.fileTree = {};
    this.ignoreDirs = [...ignoreDirs]; // Add directories to ignore here
  }

  async initializeChalk() {
    const chalkModule = require("chalk");
    this.chalk = chalkModule.default || chalkModule;
    // Define your extension colors here
    this.extensionColors = {
      ".js": chalk.yellow,
      ".html": chalk.red,
      ".css": chalk.blue,
      ".json": chalk.green,
      ".md": chalk.cyan,
      ".txt": chalk.white,
      ".xml": chalk.magenta,
      ".ts": chalk.yellowBright,
      ".tsx": chalk.blueBright,
      ".scss": chalk.cyanBright,
      ".py": chalk.redBright,
      ".java": chalk.greenBright,
      ".c": chalk.magentaBright,
      ".cpp": chalk.grey,
      ".go": chalk.blackBright,
      ".rs": chalk.orange,
      ".php": chalk.hex("#7F5AF0"),
      ".rb": chalk.hex("#D00000"),
      ".swift": chalk.hex("#FFD700"),
      ".kotlin": chalk.hex("#FF6347"),
      ".scala": chalk.hex("#B7410E"),
      ".sh": chalk.hex("#2E8B57"),
      ".bash": chalk.hex("#2E8B57"),
      ".pl": chalk.hex("#DC143C"),
      ".sql": chalk.hex("#800080"),
      ".yml": chalk.hex("#9ACD32"),
      ".yaml": chalk.hex("#9ACD32"),
      ".dockerfile": chalk.hex("#40E0D0"),
      ".R": chalk.hex("#276DC3"),
      ".f": chalk.hex("#4D41B1"),
      ".rs": chalk.hex("#DEA584"),
      ".dart": chalk.hex("#0175C2"),
      ".lua": chalk.hex("#000080"),
      ".groovy": chalk.hex("#4298B5"),
      ".ps1": chalk.hex("#012456"),
      ".vbs": chalk.hex("#15DCFF"),
      ".rkt": chalk.hex("#5D021F"),
      ".clj": chalk.hex("#DB5855"),
      ".elm": chalk.hex("#60B5CC"),
      ".h": chalk.hex("#A4C639"),
      ".hpp": chalk.hex("#178600"),
      ".asm": chalk.hex("#6A463F"),
      ".s": chalk.hex("#6E4C13"),
      ".lisp": chalk.hex("#3FB68B"),
      ".hs": chalk.hex("#5D4F85"),
      ".kt": chalk.hex("#F18E33"),
      ".m": chalk.hex("#433446"),
      ".mm": chalk.hex("#FF8779"),
      ".v": chalk.hex("#4F87C4"),
      ".vh": chalk.hex("#ABCDEF"),
      ".sv": chalk.hex("#DAE1C2"),
      ".coffee": chalk.hex("#6F4E37"),
      ".jsx": chalk.hex("#61DAFB"),
      ".tsx": chalk.hex("#007ACC"),
      ".vue": chalk.hex("#42B883"),
      ".svelte": chalk.hex("#FF3E00"),
      ".perl": chalk.hex("#0298C3"),
      ".erl": chalk.hex("#A90533"),
      ".ex": chalk.hex("#A90533"),
      ".exs": chalk.hex("#A90533"),
      ".eex": chalk.hex("#A90533"),
      ".leex": chalk.hex("#A90533"),
      ".beam": chalk.hex("#BF61A4"),
      ".cl": chalk.hex("#19946D"),
      ".l": chalk.hex("#CC3A4B"),
      ".scala": chalk.hex("#DC322F"),
      ".clj": chalk.hex("#DDBF26"),
      ".cljs": chalk.hex("#DDBF26"),
      ".cljc": chalk.hex("#DDBF26"),
      ".groovy": chalk.hex("#4298B5"),
      ".gvy": chalk.hex("#4298B5"),
      ".gy": chalk.hex("#4298B5"),
      ".gsh": chalk.hex("#4298B5"),
      ".kt": chalk.hex("#F18E33"),
      ".kts": chalk.hex("#F18E33"),
      ".nim": chalk.hex("#37775B"),
      ".nimble": chalk.hex("#37775B"),
      ".nims": chalk.hex("#37775B"),
      ".v": chalk.hex("#5086C7"),
      ".vsh": chalk.hex("#5086C7"),
      ".vh": chalk.hex("#5086C7"),
      ".vhs": chalk.hex("#5086C7"),
      ".mathematica": chalk.hex("#DD1100"),
      ".mma": chalk.hex("#DD1100"),
      ".wl": chalk.hex("#DD1100"),
      ".ncl": chalk.hex("#28431F"),
      ".tcl": chalk.hex("#E4CC91"),
      ".forth": chalk.hex("#341708"),
      ".fth": chalk.hex("#341708"),
      ".4th": chalk.hex("#341708"),
      ".forthinc": chalk.hex("#341708"),
      ".r": chalk.hex("#198CE7"),
      ".rdata": chalk.hex("#198CE7"),
      ".rds": chalk.hex("#198CE7"),
      ".rda": chalk.hex("#198CE7"),
      ".stan": chalk.hex("#B2011D"),
      ".ml": chalk.hex("#3E4495"),
      ".mli": chalk.hex("#3E4495"),
      ".cmx": chalk.hex("#3E4495"),
      ".ecr": chalk.hex("#148B97"),
      ".dr": chalk.hex("#A50D2A"),
      ".prg": chalk.hex("#631D76"),
      ".fx": chalk.hex("#E4005B"),
      ".fs": chalk.hex("#B845FC"),
      ".fsi": chalk.hex("#B845FC"),
      ".fsx": chalk.hex("#B845FC"),
      ".fsproj": chalk.hex("#B845FC"),
      ".swift": chalk.hex("#FA7343"),
      ".factor": chalk.hex("#C71E3D"),
      ".fy": chalk.hex("#2A59FF"),
      ".fancypack": chalk.hex("#2A59FF"),
      ".bf": chalk.hex("#2A52BE"),
      ".hy": chalk.hex("#7790B2"),
      ".pro": chalk.hex("#E3D44E"),
      ".prolog": chalk.hex("#74283C"),
      ".oxygene": chalk.hex("#5A63A3"),
      ".tpl": chalk.hex("#DB3069"),
      ".nb": chalk.hex("#DD4B02"),
      ".msql": chalk.hex("#004080"),
      ".volt": chalk.hex("#1F1F1F"),
      ".vg": chalk.hex("#1F1F1F"),
    };
  }

  // This method will build the file tree
  buildTree() {
    this.fileTree = this.buildTreeHelper(this.rootPath);
  }

  // This helper method is used recursively to build the file tree
  buildTreeHelper(filePath) {
    const stats = fs.lstatSync(filePath);
    let node = { label: path.basename(filePath), nodes: [] };
  
    if (stats.isDirectory()) {
      if (this.ignoreDirs.includes(node.label)) {
        return; // Ignore this directory and do not traverse it
      }
      const children = fs.readdirSync(filePath);
      for (let child of children) {
        const childPath = path.join(filePath, child);
        node.nodes.push(this.buildTreeHelper(childPath));
      }
      node.label = this.chalk.blue(node.label); // Colour directories in blue
    } else {
      let ext = path.extname(filePath);
      let colorFunc = this.extensionColors[ext] || this.chalk.white;
      node.label = colorFunc(node.label); // Colour files based on extension
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
