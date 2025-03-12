interface Data<T> {
	node: T;
	f: number;
	g: number;
	h: number;
	prev?: Data<T>;
}

interface Options<T> {
	neighbors(node: T): T[];
	cost(from: T, to: T): number;
	heuristic(from: T, to: T): number;
}

/** The main pathfinding structure. It is simpler to just call the pasta() wrapper function. */
export class Pasta<T> {
	open: Map<T, Data<T>> = new Map<T, Data<T>>();
	closed: Set<T> = new Set<T>();
	options: Options<T>;
	target: T;

	constructor(from: T, to: T, options: Options<T>) {
		this.options = options;
		this.target = to;

		let h = options.heuristic(from, to);
		let data = createData(from, 0, h);
		this.open.set(from, data);
	}

	/** Run the whole pathfinding process and return the path (if found). */
	run(): T[] | undefined {
		const { open } = this;

		while (open.size > 0) {
			let result = this.next();
			if (result) { return result; }
		}
	}

	/** Perform next pathfinding step. There is usually no need to call this, because typical consumers are only interested in the overall pathfinding result. */
	next(): T[] | undefined {
		const { open, closed, options, target } = this;

		// pick the node with lowest f
		let current = findBest(open);
		if (!current) { return; } // should not happen, as open set should not be empty

		if (current.node == target) { return reversePath<T>(current).map(data => data.node); }

		open.delete(current.node);
		closed.add(current.node);
		// console.log("processing", debug(current));
		// console.log("open set", [...open.values()].map(debug));

		for (let neighbor of options.neighbors(current.node)) {
			if (closed.has(neighbor)) { continue; } // already processed, skip

			let g = current.g + options.cost(current.node, neighbor)
			if (open.has(neighbor)) {
				let existing = open.get(neighbor)!;
				if (g >= existing.g) { continue; } // our values are worse, skip this neighbor
				open.delete(neighbor); // we have better values: remove existing and re-add with better
			}

			let h = options.heuristic(neighbor, target);
			let data = createData(neighbor, g, h, current);
			open.set(neighbor, data);
		}
	}
}

/** A simple do-it-all wrapper that creates the pathfinding instance and runs it. */
export function pasta<T>(from: T, to: T, options: Options<T>): T[] | undefined { return new Pasta(from, to, options).run(); }

function debug<T>(item: Data<T>) { return `${item.node},g=${item.g},h=${item.h}`; }

function createData<T>(node: T, g: number, h: number, prev?: Data<T>) {
	return {
		node,
		g,
		h,
		f: g+h,
		prev
	}
}

function reversePath<T>(data: Data<T>) {
	let path: Data<T>[] = [data];
	let current = data;
	while (current.prev) {
		current = current.prev;
		path.push(current);
	}

	return path.reverse();
}

function findBest<T>(open: Map<T, Data<T>>): Data<T> | undefined {
	let best: Data<T> | undefined;
	for (let data of open.values()) {
		let better = false;
		if (!best) {
			better = true;
		} else if (data.f < best.f) {
			better = true;
		} else if (data.f == best.f && data.h < best.h) {
			better = true;
		}
		if (better) { best = data; }
	}
	return best;
}
