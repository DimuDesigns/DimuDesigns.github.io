const CELL_WIDTH = 160,
      CELL_HEIGHT = 160,
      CELL_X_OFFSET = 80,
      CELL_Y_OFFSET = 80;
      
      
document.addEventListener("DOMContentLoaded", event => {
    let ttt = new TicTacToe();  
    ttt.init();
    
});

/**
 * Manager class that manipulates inline SVG to simulate 
 * a game of Tic-Tac-Toe.
 */
class TicTacToe {
          
    constructor() {
        this.index = 0;
        this.lookUp = {};
        this.cellGroups = [
            // Grid rows            
            ["cell_0_0", "cell_1_0", "cell_2_0"],
            ["cell_0_1", "cell_1_1", "cell_2_1"],
            ["cell_0_2", "cell_1_2", "cell_2_2"],
            
            // Grid columns
            ["cell_0_0", "cell_0_1", "cell_0_2"],
            ["cell_1_0", "cell_1_1", "cell_1_2"],
            ["cell_2_0", "cell_2_1", "cell_2_2"],
            
            // Grid diagonals
            ["cell_0_0", "cell_1_1", "cell_2_2"],
            ["cell_0_2", "cell_1_1", "cell_2_0"]
        ];
    }
    
    /**
     *  Initializes the game board; adding event listeners.
     */
    init() {
        let hitArea = document.getElementById("hit-area"),
            resetButton = document.getElementById("reset-button"),
            newGameButton = document.getElementById("new-game-button");
        
        this.initCellGroupIndexMap();
        
        hitArea.addEventListener("click", e => this.updateGrid(e), false);
        
        hitArea.addEventListener(
            "touchstart",
            e => {
                e.preventDefault();
                this.updateGrid(e.targetTouches[0]);
            },
            false
        );
        
        resetButton.addEventListener("click", e => this.reset());
        resetButton.addEventListener(
            "touchstart",
            e => {
                e.preventDefault();
                
                this.reset();
            }
        );
        
        newGameButton.addEventListener(
            "click",
            e => {
                
                this.reset();
                newGameButton.classList.remove("show-new-game");
            },
            false
        );
        
        newGameButton.addEventListener(
            "touchstart",
            e => {
                e.preventDefault();
                
                this.reset();
                newGameButton.classList.remove("show-new-game");
            },
            false
        );
        
        
    }
    
    /**
     * A map used to optimize win condition calculations.
     *
     */
    initCellGroupIndexMap() {
        this.cellGroupIndexMap = {
            "cell_0_0":[0,3,6],
            "cell_1_0":[0,4],
            "cell_2_0":[0,5,7],
            "cell_0_1":[1,3],
            "cell_1_1":[1,4,6,7],
            "cell_2_1":[1,5],
            "cell_0_2":[2,3,7],
            "cell_1_2":[2,4],
            "cell_2_2":[2,5,6]
        };
    }
    
    /**
     * Updates the game board in response to a click or touch event in the
     * grid's designated hit-area; adds an X or O on even-numbered turns 
     * and odd-numbered turns respectively.
     *
     * @param {Event|Touch} e Either an Event or Touch instance depending on the event context (click or touch).
     */
    updateGrid(e) {
        let svgGeomElement = e.target,
            inverseMatrix = svgGeomElement.getScreenCTM().inverse(),
            cellX = Math.floor((inverseMatrix.a * e.clientX + inverseMatrix.e - CELL_X_OFFSET) / CELL_WIDTH),
            cellY = Math.floor((inverseMatrix.d * e.clientY + inverseMatrix.f - CELL_Y_OFFSET) / CELL_HEIGHT),
            cellId = `cell_${cellX}_${cellY}`,
            blockContainer = document.getElementById("block-container");
        
        if (!document.getElementById(cellId)) {
            let blockRef = (this.index++ % 2 === 0) ? "#x-block":"#o-block",
                x = CELL_X_OFFSET + cellX * CELL_WIDTH,
                y = CELL_Y_OFFSET + cellY * CELL_HEIGHT;
                
            this.lookUp[cellId] = blockRef;
            
            blockContainer.innerHTML += `<use id="${cellId}" x="${x}" y="${y}" width="100%" height="100%" xlink:href="${blockRef}"/>`;  
        }
        
        if (this.checkWinCondition(cellId) || blockContainer.childNodes.length == 9) {
            let newGameButton = document.getElementById("new-game-button");
            
            newGameButton.classList.add("show-new-game");
        }
            
    }
    
    /**
     * Resets the game grid; removes all child cell elements and restores initial game state.
     */
    reset() {
        document.getElementById("block-container").innerHTML = null;
        this.index = 0;
        this.lookUp = {};
        this.initCellGroupIndexMap();
    }
    
    /**
     * Check win condition for a specific cellId
     *
     * @param {String} cellId Id referencing a given cell.
     */
    checkWinCondition(cellId) {
        let filtered,
            state = false,
            group;
        
        return this.cellGroupIndexMap[cellId].concat().some(groupIndex => {
            group = this.cellGroups[groupIndex];
            
            filtered = group.map(item => this.lookUp[item]).filter(item => !!item);
            
            if (filtered.length > 1) {
                state = filtered.every(item => item === "#x-block") || filtered.every(item => item === "#o-block");
                
                if (!state) {
                    // remove all references to group index
                    group.forEach(item => {
                        this.cellGroupIndexMap[item] = this.cellGroupIndexMap[item].filter(item => item !== groupIndex);
                    });
                } 
            }
                        
            return state && filtered.length === 3;
        });
    }
}
