const fs = require("fs");
const Maze = require("./maze");

function createMazes(mazeSize, numMazes, isSave=true) {
    const mazes = [];

    for (let i = 0; i <= numMazes; i++) {
        console.log("maze", i);
        const maze = new Maze({width: mazeSize, height: mazeSize});
        maze.generate();
    
        const mazeGenerated = maze.draw();
        mazes.push(mazeGenerated);
    }

    if (isSave) {
        fs.writeFileSync(`./size-${mazeSize}-mazes.json`, JSON.stringify(mazes, null, 2) , 'utf-8');
    }

    return mazes;
}

const original_mazes = createMazes(13, 10, false); // this will create mazes of 27x27 (only can do odd numbers)
const flatten_mazes = [];

// flattens maze into 1D array as that is what we used to create are environment for the agent
// also adding higher value rewards (the bigger treats for pacman)

for (let maze of original_mazes) {
    flatten_mazes.push([]);

    for (let row of maze) {
        for (let reward of row) {
            let newReward = reward;

            if (reward !== 1) {
                const seed = Math.random();

                if (seed > 0.95) {
                    newReward = 4;
                } else if (seed > 0.85) {
                    newReward = 3;
                } else if (seed > 0.75) {
                    newReward = 2;
                }
            }

            flatten_mazes[flatten_mazes.length - 1].push(newReward);
        }
    }
}

fs.writeFileSync(`./test-mazes.json`, JSON.stringify(flatten_mazes, null, 2) , 'utf-8');

process.exit(1);
