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
const START = "1,2";
const END = "38,7";
const DIRS_CARDINAL = [[-1,0],[1,0],[0,-1],[0,1]];
const DIRS_DIAGONAL = [[-1,-1],[-1,1],[1,-1],[1,1]];
let WALLS: string[] = [];
let offsetY = 1;

function randInt(from: number, to: number) {
	return from + Math.floor(Math.random()*(to-from+1));
}

for (let i=0;i<100;i++) {
	let x = randInt(2, W-3);
	let y = randInt(1, H-2);
	WALLS.push([x, y].join(","));
}

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

function cost(from: string, to: string, topo: 4 | 8) {
	let [x1, y1] = from.split(",").map(Number);
	let [x2, y2] = to.split(",").map(Number);
	switch (topo) {
		case 4: return taxicab(x1, y1, x2, y2);
		case 8: return octile(x1, y1, x2, y2);
	}
}
function cost4(from: string, to: string) { return cost(from, to, 4); }
function cost8(from: string, to: string) { return cost(from, to, 8); }

function neighbors(node: string, topo: 4 | 8) {
	let [x, y] = node.split(",").map(Number);
	let dirs;
	switch (topo) {
		case 4: dirs = [...DIRS_CARDINAL]; break;
		case 8: dirs = [...DIRS_CARDINAL, ...DIRS_DIAGONAL]; break;
	}
	return dirs.map(([dx, dy]) => [x+dx, y+dy])
			.filter(([x, y]) => x>=0 && y>=0 && x<W && y<H)
			.map(xy => xy.join(","))
			.filter(key => !WALLS.includes(key))
}
function neighbors4(node: string) { return neighbors(node, 4); }
function neighbors8(node: string) { return neighbors(node, 8); }


function render(path: string[], pasta: Pasta<string>, label: string) {
	for (let i=0;i<W;i++) {
		for (let j=0;j<H;j++) {
			write(cursorTo(i+2, j+offsetY));
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
	write(cursorTo(2, offsetY+H), label, ": path length=", String(path.length));

	offsetY += H + 2;
}


write(clearScreen);

let pasta = new Pasta(START, END, { cost:cost4, neighbors:neighbors4, heuristic:cost4 });
render(pasta.run()!, pasta, "4 neighbors");

pasta = new Pasta(START, END, { cost:cost8, neighbors:neighbors8, heuristic:cost8 });
render(pasta.run()!, pasta, "8 neighbors");

write("\n\n");

