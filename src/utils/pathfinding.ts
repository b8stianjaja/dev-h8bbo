import { GridPosition, PathNode } from '../types';

export const getGridDistance = (a: GridPosition, b: GridPosition) => {
  // Manhattan distance is often better for 4-way, but Diagonal is allowed here
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};

// Check if a specific tile is walkable based on static map and furniture
export const isWalkable = (x: number, y: number, width: number, height: number, collisionMap: number[][]) => {
  if (x < 0 || x >= width || y < 0 || y >= height) return false;
  return collisionMap[y][x] === 0; // 0 is walkable
};

const getNeighbors = (node: GridPosition, width: number, height: number, collisionMap: number[][]): GridPosition[] => {
  const neighbors: GridPosition[] = [];
  
  // 8-Directional movement
  const dirs = [
    { x: 0, y: -1 }, // N
    { x: 1, y: -1 }, // NE
    { x: 1, y: 0 },  // E
    { x: 1, y: 1 },  // SE
    { x: 0, y: 1 },  // S
    { x: -1, y: 1 }, // SW
    { x: -1, y: 0 }, // W
    { x: -1, y: -1 } // NW
  ];

  for (const dir of dirs) {
    const nx = node.x + dir.x;
    const ny = node.y + dir.y;

    if (isWalkable(nx, ny, width, height, collisionMap)) {
      // Prevent corner cutting
      // If moving diagonal, check if adjacent cardinals are blocked.
      if (Math.abs(dir.x) === 1 && Math.abs(dir.y) === 1) {
         if (!isWalkable(node.x + dir.x, node.y, width, height, collisionMap) || 
             !isWalkable(node.x, node.y + dir.y, width, height, collisionMap)) {
           continue; 
         }
      }
      neighbors.push({ x: nx, y: ny });
    }
  }
  return neighbors;
};

export const findPath = (start: GridPosition, end: GridPosition, collisionMap: number[][]): GridPosition[] => {
  const height = collisionMap.length;
  const width = collisionMap[0].length;

  if (!isWalkable(end.x, end.y, width, height, collisionMap)) {
    return [];
  }

  const openList: PathNode[] = [];
  const closedList: Set<string> = new Set();

  openList.push({
    x: start.x,
    y: start.y,
    f: 0,
    g: 0,
    h: 0,
    parent: null,
  });

  while (openList.length > 0) {
    // Sort by F cost
    openList.sort((a, b) => a.f - b.f);
    const currentNode = openList.shift()!;
    const currentKey = `${currentNode.x},${currentNode.y}`;

    if (currentNode.x === end.x && currentNode.y === end.y) {
      const path: GridPosition[] = [];
      let curr: PathNode | null = currentNode;
      while (curr) {
        path.push({ x: curr.x, y: curr.y });
        curr = curr.parent;
      }
      return path.reverse().slice(1); // Remove start node
    }

    closedList.add(currentKey);

    const neighbors = getNeighbors(currentNode, width, height, collisionMap);

    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      if (closedList.has(neighborKey)) continue;

      // Cost is 1 for cardinal, 1.4 for diagonal (approx sqrt(2))
      const isDiagonal = neighbor.x !== currentNode.x && neighbor.y !== currentNode.y;
      const gCost = currentNode.g + (isDiagonal ? 1.4 : 1);

      let neighborNode = openList.find(n => n.x === neighbor.x && n.y === neighbor.y);

      if (!neighborNode) {
        neighborNode = {
          x: neighbor.x,
          y: neighbor.y,
          f: 0,
          g: gCost,
          h: getGridDistance(neighbor, end),
          parent: currentNode,
        };
        neighborNode.f = neighborNode.g + neighborNode.h;
        openList.push(neighborNode);
      } else if (gCost < neighborNode.g) {
        neighborNode.g = gCost;
        neighborNode.parent = currentNode;
        neighborNode.f = neighborNode.g + neighborNode.h;
      }
    }
  }

  return [];
};