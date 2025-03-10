import { Pasta } from "./pasta.ts";


const ESC = "\u001B";
const CSI = `${ESC}[`;
const SEP = ";";
const clearScreen = `${ESC}c`;
const BOLD = `${CSI}1m`;
const RED = `${CSI}91m`;
const GREEN = `${CSI}32m`;
const GREEN_BRIGHT = `${CSI}92m`;
const WHITE = `${CSI}97m`;
const RESET = `${CSI}0m`;

// const OSC = "\u001B]";
// const BEL = "\u0007";

const W = 40;
const H = 10;
const START = "1,5";
const END = "38,5";
const DIRS_CARDINAL = [[-1,0],[1,0],[0,-1],[0,1]];
const DIRS_DIAGONAL = [[-1,-1],[-1,1],[1,-1],[1,1]];

const WALLS = ["20,5"];



function cursorTo(x: number, y: number) {
	return CSI + (y+1) + SEP + (x+1) + "H";
};

function write(...strings: string[]) {
	let encoder = new TextEncoder();
	strings.forEach(str => Deno.stdout.writeSync(encoder.encode(str)));
}

const OCTILE_CARDINAL = 2;
const OCTILE_DIAGONAL = 3;
function taxicab(x1: number, y1: number, x2: number, y2: number) { return Math.abs(x1-x2) + Math.abs(y1-y2); }
function octile(x1: number, y1: number, x2: number, y2: number) {
	let dx = Math.abs(x1-x2);
	let dy = Math.abs(y1-y2);
	return OCTILE_CARDINAL * Math.max(dx, dy) + (OCTILE_DIAGONAL-OCTILE_CARDINAL) * Math.min(dx, dy)
}

function cost(from: string, to: string) {
	let [x1, y1] = from.split(",").map(Number);
	let [x2, y2] = to.split(",").map(Number);
//	return octile(x1, y1, x2, y2);
	return taxicab(x1, y1, x2, y2);
}

function neighbors(node: string) {
	let [x, y] = node.split(",").map(Number);
//	return [...DIRS_CARDINAL, ...DIRS_DIAGONAL]
	return [...DIRS_CARDINAL]
			.map(([dx, dy]) => [x+dx, y+dy])
			.filter(([x, y]) => x>=0 && y>=0 && x<W && y<H)
			.map(xy => xy.join(","))
			.filter(key => !WALLS.includes(key))
}

function render(path: string[]) {
	write(clearScreen);
	for (let i=0;i<W;i++) {
		for (let j=0;j<H;j++) {
			write(cursorTo(i+2, j+1));
			let key = [i,j].join(",");
			if (key == START) {
				write(BOLD, GREEN_BRIGHT, "^", RESET);
			} else if (key == END) {
				write(BOLD, GREEN_BRIGHT, "$", RESET);
			} else if (WALLS.includes(key)) {
				write(BOLD, RED, "#", RESET);
			} else if (path.includes(key)) {
				write(BOLD, GREEN_BRIGHT, ".", RESET);
			} else if (pasta.closed.has(key)) {
				write(GREEN, ".", RESET);
			} else {
				write(".");
			}
		}
	}
}


let options = { cost, neighbors, heuristic: cost };
let pasta = new Pasta(START, END, options);
/* *
while (true) {
	let path = pasta.next();
	render(path || []);
	if (path) break;
	await new Promise(resolve => setTimeout(resolve, 500));
}
/* */

 render(pasta.run()!);
write("\n\n");

