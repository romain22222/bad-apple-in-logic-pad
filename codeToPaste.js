// Bad Apple In Logic Pad ?!

// by romain22222

function startMusic() {
  window.BAAudio.play();
}

function stopMusic() {
  window.BAAudio.pause();
  window.BAAudio.currentTime = 0;
}

async function extractNthFileAsBWRows(id) {
  if (!window.BAFiles) {
    const { default: JSZip } = await import("https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm");
    // 1. Fetch and load ZIP
    const response = await fetch("https://cdn.jsdelivr.net/gh/Felixoofed/badapple-frames/frames.zip");
    const arrayBuffer = await response.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // 2. Pick nth file
    window.BAFilenames = Object.keys(zip.files);
    window.BAFiles = zip.files;
  }

  if (id < 0 || id > window.BAFiles.length) {
    throw new Error(`Wrong limits (${id}/${window.BAFiles.length})`)
  }

  const canvas = document.createElement("canvas");

  const ctx = canvas.getContext("2d");
  
  const fileName = window.BAFilenames[id];
  const fileObj = window.BAFiles[fileName];

  const blob = await fileObj.async("blob");

  const imgUrl = URL.createObjectURL(blob);
  const img = await new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = imgUrl;
  });

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const { data } = ctx.getImageData(0, 0, img.width, img.height);

  const resF = 480 / window.resolution;

  const rows = [];
  for (let y = 0; y < img.height; y+=resF) {
    let row = "";
    for (let x = 0; x < img.width; x+=resF) {
      const idx = (y * img.width + x) * 4;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      const brightness = (r + g + b) / 3;
      row += brightness < 128 ? "B" : "W";
    }
    rows.push(row);
  }

  URL.revokeObjectURL(imgUrl);

  window.BASolGrid = GridData.create(rows);
  window.BAEmpGrid = window.BASolGrid.tiles.map((row, i) => row.map((tile, j) => i > 1 && j > 1 ? tile.copyWith({ color: Color.Gray, fixed: false }) : tile)); 
}


let emptyPuzzle = {
  title: ".",
  grid: GridData.create(['.']),
  solution: GridData.create(['.']),
  difficulty: 1,
  author: "romain22222",
  description: ""
};

function createPuzzle(id) {
  window.frameCounter += window.skipEveryXFrames;
  if (id < 6571) extractNthFileAsBWRows(id+1, id+2);
  if (id < 0) return emptyPuzzle;
  /** @type Puzzle */
  return {
    title: `Bad Apple, ${id+1}/6572`,
    grid: window.BASolGrid.withTiles(window.BAEmpGrid.tiles),
    solution: window.BASolGrid,
    difficulty: 4+id%3,
    author: "romain22222",
    description: ""
  }
}

function r() {
  delete window.preloadBA;
  delete window.loadBA;
  delete window.framesPerSecond;
  delete window.resolution;
  delete window.videoSpeed;
  delete window.frameCounter;
  delete window.skipEveryXFrames;
  try {
    stopMusic();
  } catch (e) {}
  delete window.BAAudio;
  delete window.lpButton;
  delete window.BAFiles;
  delete window.BAFilenames;
  delete window.BAEmpGrid;
  delete window.BASolGrid;

  throw new Error("All Reset");
}
//r();

if (!window.preloadBA) {
  window.lpButton = document.querySelector("#app > div.h-dvh.w-dvw.overflow-y-auto.overflow-x-hidden.bg-neutral.text-neutral-content > div.flex.flex-col.items-stretch.w-full.min-h-full.xl\\:h-full > div > div.drawer-side.\\!overflow-x-visible.\\!overflow-y-visible.z-20.h-full.w-full > div > div > div.flex-1.flex.flex-col.gap-2 > div.tooltip.w-full.tooltip-right > button");

  window.framesPerSecond = 15;
  window.resolution = 48;
  window.videoSpeed = 1;

  window.frameCounter = -1;
  window.skipEveryXFrames = (30 * window.videoSpeed) / window.framesPerSecond;
  createPuzzle(-1);
  window.BAAudio = new Audio("https://cdn.jsdelivr.net/gh/Felixoofed/badapple-frames/badapple.mp4");
  window.BAAudio.preload = "auto";
  window.preloadBA = true;
  setTimeout(() => window.lpButton.click(), 2000);
  throw new Error("Preload Done");
} else if (!window.loadBA) {
  for (let i = 0; i < 6752 / window.skipEveryXFrames; i++) {
    setTimeout(() => window.lpButton.click(), (i+1)*1000/window.framesPerSecond);
  }
  startMusic();
  window.loadBA = true;
  throw new Error("Load Done");
}
/** @type Puzzle */
(createPuzzle(window.frameCounter));
