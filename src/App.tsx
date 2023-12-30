import './App.css'
import {useCallback, useEffect, useState} from "react";

type Coord = number | null;
type Coords = Coord[];
type ClicksProps = [Coords, Coords]

const dimension = [4, 4];
const revealCardTime = 500;
const initRevealedGrid = (grid: number[][]) => {
  return new Array(grid.length).fill("").map(() => new Array(grid[0].length).fill(false));
}

const initGrid = (rows = 4, cols = 4) => {
  const grid = [];
  if (rows <= 0 || cols <= 0) throw new Error('Rows and cols have to be bigger than 0.');

  const cardsNumber = rows * cols;

  if (cardsNumber % 2 !== 0) throw new Error('Cards number should be even.');

  const flatGrid = new Array(cardsNumber / 2).fill(1).map((card, index) => card + index);

  flatGrid.push(...flatGrid);
  flatGrid.sort(() => Math.random() - 0.5);

  for (let i = 0; i < rows; i++) {
    const start = i * cols;
    const end = start + cols;
    grid.push(flatGrid.slice(start, end))
  }

  return grid;
}

function App() {
  const [grid, setGrid] = useState(initGrid(...dimension));

  const [revealedGrid, setRevealedGrid] = useState(
    initRevealedGrid(grid)
  );

  const [clicks, setClicks] = useState<ClicksProps>([[], []]);

  const [success, setSuccess] = useState(false);

  const handleCardClick = (rowIndex: number, colIndex: number) => {
    if (clicks[0].length > 0 && clicks[1].length > 0) return;

    setRevealedGrid(prev => {
      const newPrev = [...prev];
      newPrev[rowIndex][colIndex] = true;
      return newPrev;
    });

    setClicks(([first, second]): [Coords, Coords] => {
      const newPrev: [Coords, Coords] = [[...first], [...second]];

      if (first.length > 0 && second.length === 0) {
        newPrev[1] = [rowIndex, colIndex];
      }

      if (first.length === 0) {
        newPrev[0] = [rowIndex, colIndex];
      }

      return newPrev;
    });
  }

  const getValue = useCallback((coords: Coords) => {
    if (coords.length === 0) return;
    return grid[coords[0]!][coords[1]!];
  }, [grid]);

  const handleRestart = () => {
    setClicks([[], []]);
    setRevealedGrid(initRevealedGrid(grid));
    setGrid(initGrid(...dimension));
  }

  useEffect(() => {
    if (clicks[0] === null || clicks[1] === null) return;
    if (clicks[0].length === 0 || clicks[1].length === 0) return;

    if (getValue(clicks[0]) === getValue(clicks[1])) {
      setClicks([[], []]);
      return;
    }

    const timeout = setTimeout(() => {
      setClicks([[], []])
      setRevealedGrid(prev => {
        const newPrev = [...prev];
        newPrev[clicks[0][0]!][clicks[0][1]!] = false;
        newPrev[clicks[1][0]!][clicks[1][1]!] = false;
        return newPrev;
      });
    }, revealCardTime);

    return () => clearTimeout(timeout);
  }, [clicks, getValue, revealedGrid]);

  useEffect(() => {
    const success = !revealedGrid.flatMap(card => card).some(card => card === false);
    setSuccess(success);
  }, [revealedGrid]);

  return (
    <div className={'app'}>
      <div className={'grid'}>
        {grid.map((row, rowIndex) => (
          <div className={'row'} key={rowIndex}>
            {row.map((number, colIndex) => (
              <div
                onClick={() => handleCardClick(rowIndex, colIndex)}
                className={'card'}
                key={colIndex}
              >
                {revealedGrid[rowIndex][colIndex] ? number : ''}
              </div>
            ))}
          </div>
        ))}
      </div>
      {success && (
        <div className={'success'}>
          <h2>Success</h2>
        </div>
      )
      }
      <div style={{marginTop: '20px'}}>
        <button onClick={handleRestart}>Restart</button>
      </div>
    </div>
  )
}

export default App
