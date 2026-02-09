const SIZES = [
  { label: "8x8", width: 8, height: 8 },
  { label: "8x16", width: 8, height: 16 },
  { label: "16x16", width: 16, height: 16 },
  { label: "16x24", width: 16, height: 24 },
  { label: "24x24", width: 24, height: 24 },
  { label: "24x32", width: 24, height: 32 },
];

const ASCII_START = 32;
const ASCII_END = 126;
const TOTAL_CHARS = ASCII_END - ASCII_START + 1;

const fontSizeSelect = document.getElementById("fontSize");
const grid = document.getElementById("grid");
const previewGrid = document.getElementById("previewGrid");
const status = document.getElementById("status");
const currentCharLabel = document.getElementById("currentChar");
const clearGlyphButton = document.getElementById("clearGlyph");
const copyGlyphButton = document.getElementById("copyGlyph");
const pasteGlyphButton = document.getElementById("pasteGlyph");
const mergeGlyphButton = document.getElementById("mergeGlyph");
const nudgeUpButton = document.getElementById("nudgeUp");
const nudgeLeftButton = document.getElementById("nudgeLeft");
const nudgeDownButton = document.getElementById("nudgeDown");
const nudgeRightButton = document.getElementById("nudgeRight");
const flipHorizontalButton = document.getElementById("flipHorizontal");
const flipVerticalButton = document.getElementById("flipVertical");
const symmetryVerticalButton = document.getElementById("symmetryVertical");
const symmetryHorizontalButton = document.getElementById("symmetryHorizontal");
const fontFileInput = document.getElementById("fontFile");
const saveFontButton = document.getElementById("saveFont");
const exportCArrayButton = document.getElementById("exportCArray");

let fontWidth = 8;
let fontHeight = 8;
let glyphs = [];
let activeIndex = 0;
let isPainting = false;
let paintValue = false;
let copiedGlyph = null;

function createEmptyGlyph() {
  return new Array(fontWidth * fontHeight).fill(false);
}

function setStatus(message, isError = false) {
  status.textContent = message;
  status.style.color = isError ? "#b42318" : "#1f4b99";
}

function updateCurrentCharLabel() {
  const charCode = ASCII_START + activeIndex;
  const char = String.fromCharCode(charCode);
  const display = char === " " ? "SPACE" : char;
  currentCharLabel.textContent = `Editing: ${display} (${charCode})`;
}

function updatePasteButtonState() {
  const isDisabled = !copiedGlyph;
  pasteGlyphButton.disabled = isDisabled;
  mergeGlyphButton.disabled = isDisabled;
}

function buildGrid() {
  grid.innerHTML = "";
  grid.style.gridTemplateColumns = `repeat(${fontWidth}, 22px)`;
  grid.style.gridTemplateRows = `repeat(${fontHeight}, 22px)`;
  for (let y = 0; y < fontHeight; y += 1) {
    for (let x = 0; x < fontWidth; x += 1) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.index = y * fontWidth + x;
      cell.addEventListener("pointerdown", handlePaintStart);
      cell.addEventListener("pointerenter", handlePaintMove);
      grid.appendChild(cell);
    }
  }
  grid.addEventListener("pointerup", stopPainting);
  grid.addEventListener("pointerleave", stopPainting);
  updateGridFromGlyph();
}

function handlePaintStart(event) {
  event.preventDefault();
  const index = Number(event.currentTarget.dataset.index);
  const glyph = glyphs[activeIndex];
  paintValue = !glyph[index];
  isPainting = true;
  setGlyphCell(index, paintValue);
}

function handlePaintMove(event) {
  if (!isPainting) {
    return;
  }
  const index = Number(event.currentTarget.dataset.index);
  setGlyphCell(index, paintValue);
}

function stopPainting() {
  isPainting = false;
}

function setGlyphCell(index, value) {
  const glyph = glyphs[activeIndex];
  if (glyph[index] === value) {
    return;
  }
  glyph[index] = value;
  const cell = grid.querySelector(`.cell[data-index="${index}"]`);
  if (cell) {
    cell.classList.toggle("on", value);
  }
  updatePreviewItem(activeIndex);
}

function updateGridFromGlyph() {
  const glyph = glyphs[activeIndex];
  grid.querySelectorAll(".cell").forEach((cell) => {
    const index = Number(cell.dataset.index);
    cell.classList.toggle("on", glyph[index]);
  });
}

function nudgeGlyph(dx, dy) {
  const glyph = glyphs[activeIndex];
  const nextGlyph = createEmptyGlyph();
  for (let y = 0; y < fontHeight; y += 1) {
    for (let x = 0; x < fontWidth; x += 1) {
      const sourceX = x - dx;
      const sourceY = y - dy;
      if (sourceX < 0 || sourceX >= fontWidth || sourceY < 0 || sourceY >= fontHeight) {
        continue;
      }
      const sourceIndex = sourceY * fontWidth + sourceX;
      nextGlyph[y * fontWidth + x] = glyph[sourceIndex];
    }
  }
  glyphs[activeIndex] = nextGlyph;
  updateGridFromGlyph();
  updatePreviewItem(activeIndex);
}

function flipGlyph(flipHorizontal, flipVertical) {
  const glyph = glyphs[activeIndex];
  const nextGlyph = createEmptyGlyph();
  for (let y = 0; y < fontHeight; y += 1) {
    for (let x = 0; x < fontWidth; x += 1) {
      const sourceX = flipHorizontal ? fontWidth - 1 - x : x;
      const sourceY = flipVertical ? fontHeight - 1 - y : y;
      const sourceIndex = sourceY * fontWidth + sourceX;
      nextGlyph[y * fontWidth + x] = glyph[sourceIndex];
    }
  }
  glyphs[activeIndex] = nextGlyph;
  updateGridFromGlyph();
  updatePreviewItem(activeIndex);
}

function mirrorGlyphLeftToRight() {
  const glyph = glyphs[activeIndex];
  const nextGlyph = [...glyph];
  const halfWidth = Math.floor(fontWidth / 2);
  for (let y = 0; y < fontHeight; y += 1) {
    for (let x = 0; x < halfWidth; x += 1) {
      const sourceIndex = y * fontWidth + x;
      const targetX = fontWidth - 1 - x;
      nextGlyph[y * fontWidth + targetX] = glyph[sourceIndex];
    }
  }
  glyphs[activeIndex] = nextGlyph;
  updateGridFromGlyph();
  updatePreviewItem(activeIndex);
}

function mirrorGlyphTopToBottom() {
  const glyph = glyphs[activeIndex];
  const nextGlyph = [...glyph];
  const halfHeight = Math.floor(fontHeight / 2);
  for (let y = 0; y < halfHeight; y += 1) {
    for (let x = 0; x < fontWidth; x += 1) {
      const sourceIndex = y * fontWidth + x;
      const targetY = fontHeight - 1 - y;
      nextGlyph[targetY * fontWidth + x] = glyph[sourceIndex];
    }
  }
  glyphs[activeIndex] = nextGlyph;
  updateGridFromGlyph();
  updatePreviewItem(activeIndex);
}

function buildPreview() {
  previewGrid.innerHTML = "";
  for (let i = 0; i < TOTAL_CHARS; i += 1) {
    const charCode = ASCII_START + i;
    const char = String.fromCharCode(charCode);
    const item = document.createElement("div");
    item.className = "preview-item";
    item.dataset.index = i;

    const canvas = document.createElement("canvas");
    canvas.className = "preview-canvas";
    item.appendChild(canvas);

    const label = document.createElement("span");
    label.textContent = `${char === " " ? "SPACE" : char} (${charCode})`;
    item.appendChild(label);

    item.addEventListener("click", () => {
      setActiveIndex(i);
    });

    previewGrid.appendChild(item);
  }
  updatePreview();
}

function updatePreview() {
  previewGrid.querySelectorAll(".preview-item").forEach((item) => {
    const index = Number(item.dataset.index);
    item.classList.toggle("active", index === activeIndex);
    drawGlyphToCanvas(glyphs[index], item.querySelector("canvas"));
  });
}

function updatePreviewItem(index) {
  const item = previewGrid.querySelector(`.preview-item[data-index="${index}"]`);
  if (!item) {
    return;
  }
  drawGlyphToCanvas(glyphs[index], item.querySelector("canvas"));
}

function drawGlyphToCanvas(glyph, canvas) {
  const scale = Math.max(1, Math.floor(48 / Math.max(fontWidth, fontHeight)));
  canvas.width = fontWidth * scale;
  canvas.height = fontHeight * scale;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#1f4b99";
  for (let y = 0; y < fontHeight; y += 1) {
    for (let x = 0; x < fontWidth; x += 1) {
      const index = y * fontWidth + x;
      if (glyph[index]) {
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }
}

function setActiveIndex(index) {
  activeIndex = index;
  updateCurrentCharLabel();
  updateGridFromGlyph();
  updatePreview();
}

function initializeGlyphs() {
  glyphs = Array.from({ length: TOTAL_CHARS }, () => createEmptyGlyph());
  activeIndex = 0;
  copiedGlyph = null;
  updatePasteButtonState();
  updateCurrentCharLabel();
  buildGrid();
  buildPreview();
  setStatus(`Created a new ${fontWidth}x${fontHeight} font.`, false);
}

function bytesPerGlyph() {
  return Math.ceil((fontWidth * fontHeight) / 8);
}

function totalFileBytes() {
  return bytesPerGlyph() * TOTAL_CHARS;
}

function glyphToBytes(glyph) {
  const bytes = new Uint8Array(bytesPerGlyph());
  let bitIndex = 0;
  for (let x = 0; x < fontWidth; x += 1) {
    for (let y = 0; y < fontHeight; y += 1) {
      const index = y * fontWidth + x;
      if (glyph[index]) {
        const byteIndex = Math.floor(bitIndex / 8);
        const bitOffset = bitIndex % 8;
        bytes[byteIndex] |= 1 << bitOffset;
      }
      bitIndex += 1;
    }
  }
  return bytes;
}

function bytesToGlyph(bytes, offset) {
  const glyph = createEmptyGlyph();
  let bitIndex = 0;
  for (let x = 0; x < fontWidth; x += 1) {
    for (let y = 0; y < fontHeight; y += 1) {
      const byteIndex = offset + Math.floor(bitIndex / 8);
      const bitOffset = bitIndex % 8;
      const isOn = (bytes[byteIndex] & (1 << bitOffset)) !== 0;
      glyph[y * fontWidth + x] = isOn;
      bitIndex += 1;
    }
  }
  return glyph;
}

function triggerDownload(blob, filename) {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function saveFont() {
  const totalBytes = totalFileBytes();
  const output = new Uint8Array(totalBytes);
  let offset = 0;
  for (let i = 0; i < TOTAL_CHARS; i += 1) {
    const glyphBytes = glyphToBytes(glyphs[i]);
    output.set(glyphBytes, offset);
    offset += glyphBytes.length;
  }
  const blob = new Blob([output], { type: "application/octet-stream" });
  triggerDownload(blob, `bitmap-font-${fontWidth}x${fontHeight}.rmsfont`);
  setStatus(`Saved font as ${output.length} bytes.`, false);
}

function buildFontBytes() {
  const totalBytes = totalFileBytes();
  const output = new Uint8Array(totalBytes);
  let offset = 0;
  for (let i = 0; i < TOTAL_CHARS; i += 1) {
    const glyphBytes = glyphToBytes(glyphs[i]);
    output.set(glyphBytes, offset);
    offset += glyphBytes.length;
  }
  return output;
}

function formatByte(value) {
  return `0x${value.toString(16).padStart(2, "0")}`;
}

function makeCArrayName() {
  return `bitmap_font_${fontWidth}x${fontHeight}`;
}

function exportCArray() {
  const bytes = buildFontBytes();
  const arrayName = makeCArrayName();
  const lines = [];
  lines.push(`#include <stdint.h>`);
  lines.push("");
  lines.push(`const uint8_t ${arrayName}[] = {`);
  const lineBytes = [];
  for (let i = 0; i < bytes.length; i += 1) {
    lineBytes.push(formatByte(bytes[i]));
    if (lineBytes.length === 12 || i === bytes.length - 1) {
      lines.push(`  ${lineBytes.join(", ")}${i === bytes.length - 1 ? "" : ","}`);
      lineBytes.length = 0;
    }
  }
  lines.push("};");
  lines.push(
    `const unsigned int ${arrayName}_length = ${bytes.length};`
  );
  lines.push(
    `const unsigned int ${arrayName}_width = ${fontWidth};`
  );
  lines.push(
    `const unsigned int ${arrayName}_height = ${fontHeight};`
  );
  lines.push(
    `const unsigned int ${arrayName}_glyph_count = ${TOTAL_CHARS};`
  );

  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  triggerDownload(blob, `${arrayName}.h`);
  setStatus(`Exported C array as ${bytes.length} bytes.`, false);
}

function handleFileLoad(event) {
  const file = event.target.files[0];
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const bytes = new Uint8Array(reader.result);
    const matchedSize = SIZES.find(
      (size) => {
        const sizeBytes = Math.ceil((size.width * size.height) / 8) * TOTAL_CHARS;
        return sizeBytes === bytes.length;
      }
    );

    if (!matchedSize) {
      setStatus(
        `File size ${bytes.length} bytes does not match any supported font size.`,
        true
      );
      return;
    }

    if (matchedSize.width !== fontWidth || matchedSize.height !== fontHeight) {
      fontWidth = matchedSize.width;
      fontHeight = matchedSize.height;
      fontSizeSelect.value = `${fontWidth}x${fontHeight}`;
    }

    glyphs = [];
    const glyphBytes = Math.ceil((fontWidth * fontHeight) / 8);
    for (let i = 0; i < TOTAL_CHARS; i += 1) {
      glyphs.push(bytesToGlyph(bytes, i * glyphBytes));
    }

    buildGrid();
    buildPreview();
    copiedGlyph = null;
    updatePasteButtonState();
    setActiveIndex(0);
    setStatus(`Loaded ${fontWidth}x${fontHeight} font (${bytes.length} bytes).`, false);
  };
  reader.readAsArrayBuffer(file);
}

fontSizeSelect.addEventListener("change", (event) => {
  const [width, height] = event.target.value.split("x").map(Number);
  fontWidth = width;
  fontHeight = height;
  initializeGlyphs();
});

clearGlyphButton.addEventListener("click", () => {
  glyphs[activeIndex] = createEmptyGlyph();
  updateGridFromGlyph();
  updatePreviewItem(activeIndex);
});

copyGlyphButton.addEventListener("click", () => {
  copiedGlyph = [...glyphs[activeIndex]];
  updatePasteButtonState();
  setStatus("Copied current glyph. Select another glyph to paste.", false);
});

pasteGlyphButton.addEventListener("click", () => {
  if (!copiedGlyph) {
    return;
  }
  glyphs[activeIndex] = [...copiedGlyph];
  updateGridFromGlyph();
  updatePreviewItem(activeIndex);
  setStatus("Pasted glyph onto current character.", false);
});

mergeGlyphButton.addEventListener("click", () => {
  if (!copiedGlyph) {
    return;
  }
  const glyph = glyphs[activeIndex];
  for (let i = 0; i < glyph.length; i += 1) {
    if (copiedGlyph[i]) {
      glyph[i] = true;
    }
  }
  updateGridFromGlyph();
  updatePreviewItem(activeIndex);
  setStatus("Merged glyph onto current character.", false);
});

nudgeUpButton.addEventListener("click", () => nudgeGlyph(0, -1));
nudgeLeftButton.addEventListener("click", () => nudgeGlyph(-1, 0));
nudgeDownButton.addEventListener("click", () => nudgeGlyph(0, 1));
nudgeRightButton.addEventListener("click", () => nudgeGlyph(1, 0));
flipHorizontalButton.addEventListener("click", () => {
  flipGlyph(true, false);
  setStatus("Mirrored glyph horizontally.", false);
});
flipVerticalButton.addEventListener("click", () => {
  flipGlyph(false, true);
  setStatus("Flipped glyph vertically.", false);
});
symmetryVerticalButton.addEventListener("click", () => {
  mirrorGlyphTopToBottom();
  setStatus("Mirrored top half to the bottom.", false);
});
symmetryHorizontalButton.addEventListener("click", () => {
  mirrorGlyphLeftToRight();
  setStatus("Mirrored left half to the right.", false);
});

fontFileInput.addEventListener("change", handleFileLoad);

saveFontButton.addEventListener("click", saveFont);
exportCArrayButton.addEventListener("click", exportCArray);

initializeGlyphs();
