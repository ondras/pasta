import { Pasta } from "./pasta.ts";
import { assertEquals, assert } from "jsr:@std/assert";
import * as utils from "./utils.ts";


/*
A B C D E
F G H I J
K L M N O
P Q R S T
U V W X Y
*/
let COLS = 5;
let WALLS_MID = new Set(["N", "R", "S"]);
let WALLS_SIDE = new Set(["N", "O"]);
let WALLS_IMPOSSIBLE = new Set(["M", "N", "O", "R", "W"]);


Deno.test("walls, topo 8, cost=euclidean", () => {
	let options = createOptions({topo:8, walls:"mid", cost:"e"});
	let path = new Pasta("A", "Y", options).run();
	assert(path);
	assertEquals(path.join(""), "AGHIOTY");
});

Deno.test("empty, topo 8", () => {
	let options = createOptions({topo:8, walls:false});
	let path = new Pasta("A", "Y", options).run();
	assert(path);
	assertEquals(path.join(""), "AGMSY");
});

Deno.test("walls, topo 8", () => {
	let options = createOptions({topo:8, walls:"mid"});
	let path = new Pasta("A", "Y", options).run();
	assert(path);
	assertEquals(path.join(""), "AGMIOTY");
});

Deno.test("impossible, topo 8", () => {
	let options = createOptions({topo:8, walls:"impossible"});
	let path = new Pasta("A", "Y", options).run();
	assert(!path);
});

Deno.test("empty, topo 4", () => {
	let options = createOptions({topo:4, walls:false});
	let path = new Pasta("A", "Y", options).run();
	assert(path);
	assertEquals(path.join(""), "ABCDEJOTY");
});

Deno.test("walls, topo 4", () => {
	let options = createOptions({topo:4, walls:"side"});
	let path = new Pasta("A", "Y", options).run();
	assert(path);
	assertEquals(path.join(""), "ABCHMRSTY");
});

Deno.test("detailed, empty, topo 8", () => {
	let options = createOptions({topo:8, walls:false});
	let p = new Pasta("A", "Y", options);

	let result = p.next();
	assert(!result, "first iteration - done");
	assertSetKeys(p.closed, "A", "first iteration - closed set");
	assertMapKeys(p.open, "BFG", "first iteration - open set");

	result = p.next();
	assert(!result, "second iteration - done");
	assertSetKeys(p.closed, "AG", "second iteration - closed set");
	assertMapKeys(p.open, "BCFHKLM", "second iteration - open set");

	result = p.next();
	assert(!result, "third iteration - done");
	assertSetKeys(p.closed, "AGM", "third iteration - closed set");
	assertMapKeys(p.open, "BCFHIKLNQRS", "third iteration - open set");

	result = p.next();
	assert(!result, "fourth iteration - done");
	assertSetKeys(p.closed, "AGMS", "fourth iteration - closed set");
	assertMapKeys(p.open, "BCFHIKLNOQRTWXY", "fourth iteration - open set");

	result = p.next();
	assert(result);
	assertEquals(result.sort().join(""), "AGMSY", "fifth iteration - path");
});

interface Conf {
	topo: 4 | 8;
	walls: false | "mid" | "side" | "impossible";
	cost?: "e" | "o";
	h?: "e" | "o";
}
function createOptions(conf: Conf) {
	function cost(from: string, to: string) {
		let c1 = idToCoords(from);
		let c2 = idToCoords(to);
		if (conf.cost) {
			switch (conf.cost) {
				case "e": return utils.distEuclidean(...c1, ...c2);
				case "o": return utils.distOctile(...c1, ...c2);
			}
		} else {
			switch (conf.topo) {
				case 4: return utils.dist4(...c1, ...c2);
				case 8: return utils.dist8(...c1, ...c2);
			}
		}
	}

	function heuristic(from: string, to: string) {
		if (conf.h) {
			let c1 = idToCoords(from);
			let c2 = idToCoords(to);
			switch (conf.h) {
				case "e": return utils.distEuclidean(...c1, ...c2);
				case "o": return utils.distOctile(...c1, ...c2);
			}
		} else {
			return cost(from, to);
		}
	}

	function neighbors(node: string) {
		let [x, y] = idToCoords(node);
		let dirs = utils.DIRS;
		if (conf.topo == 4) { dirs = dirs.filter(dir => !(dir[0]*dir[1])); }
		let neighbors = dirs.map(dir => [x + dir[0], y + dir[1]] as [number, number])
			.filter(pos => {
				let [x, y] = pos;
				return x >= 0 && x < COLS && y >= 0 && y < COLS;
			})
			.map(pos => coordsToId(...pos));
		if (conf.walls) {
			let walls = {
				mid: WALLS_MID,
				side: WALLS_SIDE,
				impossible: WALLS_IMPOSSIBLE,
			}[conf.walls];
			neighbors = neighbors.filter(id => !walls.has(id));
		}
		return neighbors;
	}
	return {cost, heuristic, neighbors};
}

function idToCoords(id: string) {
	let index = id.charCodeAt(0) - "A".charCodeAt(0);
	let col = index % COLS;
	let row = Math.floor(index / COLS);
	return [col, row] as [number, number];
}

function coordsToId(x: number, y: number) {
	let index = y * COLS + x;
	return String.fromCharCode(index + "A".charCodeAt(0));
}

function assertSetKeys(set: Set<string>, expected: string, message?: string) {
	assertEquals([...set].sort().join(""), expected, message);
}

function assertMapKeys(map: Map<string, any>, expected: string, message?: string) {
	assertEquals([...map.keys()].sort().join(""), expected, message);
}
