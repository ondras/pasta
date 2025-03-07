# Pasta: a pluggable A* implementation

## Usage

BYOC -- Bring Your Own Context. The algorithm is decoupled from the underlying (graph? grid?) pathfindable data structure. You need to provide:

  - a **cost** function that computes the cost of traveling from one node to another
  - a **heuristic** function that estimates the cost of traveling from one node to the target
  - a **neighbors** function that returns a set of neighbor nodes reachable from a given node

Individual nodes can be identified by any value -- just make sure that your `neighbors` implementation generates comparable identifiers.

```ts
import { pasta } from "https://cdn.jsdelivr.net/gh/ondras/pasta@main/pasta.ts";

function cost() {

}

function neighbors() {

}

function heuristic() {

}

let options = { cost, neighbors, heuristic };
let path = pasta(from, to, options);
console.log(path);
```
