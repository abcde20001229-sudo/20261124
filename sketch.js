let bgImage; // 儲存背景圖片 bg/3.png[cite: 3]
let bgOffsetX = 0; // 記錄背景水平捲動偏移量（負值代表背景往左移動）[cite: 3]
let characterSprite; // 儲存角色一的精靈圖[cite: 3]
let walkSprite; // 儲存角色一的走路精靈圖[cite: 3]
let magicSprite; // 儲存角色一的施法精靈圖[cite: 3]
let magicEffectSprite; // 儲存角色一的魔法特效精靈圖[cite: 3]

let char2StopRaw; // 儲存角色二原始待機精靈圖 (2/stop/stop.png)
let char2ActionRaw; // 儲存角色二原始動作精靈圖 (2/action/action.png)
let char2StopClean = null; // 儲存去綠幕後的角色二待機精靈圖
let char2ActionClean = null; // 儲存去綠幕後的角色二動作精靈圖

let characterX; // 儲存角色一目前的水平中心位置[cite: 3]
let isWalking = false; // 記錄角色是否已切換為走路動畫[cite: 3]
let facingDirection = 1; // 記錄角色朝向（1 為右，-1 為左）[cite: 3]
let isCasting = false; // 記錄角色是否正在播放施法動畫[cite: 3]
let magicStartFrame = 0; // 記錄施法動畫開始時的畫面計數[cite: 3]
let magicDirection = 1; // 記錄施法時鎖定的方向[cite: 3]
let spaceIsDown = false; // 記錄空白鍵是否已按住以避免重複觸發[cite: 3]
let activeEffects = []; // 儲存目前畫面上飛行中的魔法特效[cite: 3]

let char2IsAction = false; // 記錄角色二目前是否處於 action 狀態
let char2PrevAction = false; // 記錄前一幀角色二是否處於 action 狀態，用於切換時重置影格
let char2FrameCounter = 0; // 角色二獨立的動畫計數器

// 小學英文單字問答題資料與作答狀態
const englishQuiz = {
  prompt: "小學英文單字問答",
  question: "'apple' 的中文意思是？",
  options: [
    "1. 蘋果",
    "2. 香蕉",
    "3. 橘子"
  ],
  answerIndex: 0
};
let selectedOption = null;
let optionHitboxes = [];

const frameCountInSprite = 10; // 設定精靈圖包含的影格數[cite: 3]
const frameWidth = 139.5; // 設定每個影格的寬度（1395 除以 10）[cite: 3]
const frameHeight = 196; // 設定每個影格的高度[cite: 3]
const walkFrameCount = 9; // 設定走路精靈圖包含的影格數[cite: 3]
const walkFrameWidth = 1246 / walkFrameCount; // 計算走路動畫每格的寬度[cite: 3]
const walkFrameHeight = 198; // 設定走路動畫每格的高度[cite: 3]
const magicFrameCount = 4; // 設定施法精靈圖包含的影格數[cite: 3]
const magicFrameWidth = 1039 / magicFrameCount; // 計算施法動畫每格的寬度[cite: 3]
const magicFrameHeight = 146; // 設定施法動畫每格的高度[cite: 3]
const effectFrameCount = 5; // 設定魔法特效精靈圖包含的影格數[cite: 3]
const effectFrameWidth = 740 / effectFrameCount; // 計算魔法特效每格的寬度[cite: 3]
const effectFrameHeight = 19; // 設定魔法特效每格的高度[cite: 3]
const framesPerStep = 8; // 設定動畫每隔幾個畫面更新一格[cite: 3]

// 角色二精靈圖參數
const char2StopFrameCount = 8; // stop.png 共 8 張
const char2StopTotalWidth = 803; // stop.png 全寬 803
const char2StopFrameWidth = char2StopTotalWidth / char2StopFrameCount;
const char2StopFrameHeight = 181; // stop.png 高 181

const char2ActionFrameCount = 6; // action.png 共 6 張
const char2ActionTotalWidth = 799; // action.png 全寬 799
const char2ActionFrameWidth = char2ActionTotalWidth / char2ActionFrameCount;
const char2ActionFrameHeight = 177; // action.png 高 177

const char2TriggerDistance = 240; // 角色一接近角色二多少像素內觸發 action

// 將圖片中的綠幕像素轉為透明並回傳新的 p5.Graphics 物件
function removeGreenScreen(img, greenMin = 110, dominance = 45) {
  if (!img || img.width <= 0 || img.height <= 0) return null;

  try {
    const pg = createGraphics(img.width, img.height);
    pg.pixelDensity(1);
    pg.clear();
    pg.image(img, 0, 0);
    pg.loadPixels();

    const px = pg.pixels;
    for (let i = 0; i < px.length; i += 4) {
      const r = px[i];
      const g = px[i + 1];
      const b = px[i + 2];

      if (g > greenMin && (g - r) > dominance && (g - b) > dominance) {
        px[i + 3] = 0;
      }
    }

    pg.updatePixels();
    return pg;
  } catch (err) {
    console.warn("去背失敗，改用原圖：", err);
    return img;
  }
}

function preload() { // 在畫布建立前載入圖片資源[cite: 3]
  bgImage = loadImage("bg/3.png"); // 載入背景圖片 bg/3.png[cite: 3]
  characterSprite = loadImage("1/stop/stop.png"); // 載入角色一的十格精靈圖[cite: 3]
  walkSprite = loadImage("1/walk/walk.png"); // 載入角色一的九格走路精靈圖[cite: 3]
  magicSprite = loadImage("1/magic/magic.png"); // 載入角色一的四格施法精靈圖[cite: 3]
  magicEffectSprite = loadImage("1/magic_effect/magic_effect.png"); // 載入五格魔法特效精靈圖[cite: 3]

  char2StopRaw = loadImage("2/stop/stop.png"); // 載入角色二待機精靈圖
  char2ActionRaw = loadImage("2/action/action.png"); // 載入角色二動作精靈圖
}

function setup() { // 初始化畫布與繪圖模式[cite: 3]
  createCanvas(windowWidth, windowHeight); // 建立符合視窗尺寸的畫布[cite: 3]
  imageMode(CENTER); // 讓座標代表影格的中心點[cite: 3]
  characterX = (width * 2) / 3; // 將角色初始位置設在畫布寬度的三分之二處[cite: 3]
  frameRate(60); // 將動畫更新速率設定為每秒六十格[cite: 3]

  // 在畫布建立後進行角色二綠幕去背
  char2StopClean = removeGreenScreen(char2StopRaw);
  char2ActionClean = removeGreenScreen(char2ActionRaw);
}

function draw() { // 每個畫面更新一次背景與角色[cite: 3]
  background("#87CEEB"); // 預設底色避免圖片載入前空白[cite: 3]

  // 計算單張背景圖片依畫布高度等比例縮放後的寬度（確保至少與畫布同寬以完整覆蓋畫面）[cite: 3]
  const bgAspect = bgImage && bgImage.height > 0 ? bgImage.width / bgImage.height : 1;
  const singleBgWidth = max(width, height * bgAspect);
  const singleBgHeight = height;

  // 計算三張背景串接後的可捲動範圍[cite: 3]
  const minBgOffset = width - singleBgWidth * 2;
  const maxBgOffset = singleBgWidth;
  const anchorX = (width * 2) / 3; // 角色在捲動模式下的基準水平位置[cite: 3]

  const movingRight = keyIsDown(RIGHT_ARROW); // 檢查右方向鍵目前是否按住[cite: 3]
  const movingLeft = keyIsDown(LEFT_ARROW); // 檢查左方向鍵目前是否按住[cite: 3]
  isWalking = movingRight || movingLeft; // 沒有按住左右鍵時切回站立動畫[cite: 3]
  const movementStep = constrain(width * 0.004, 2, 8); // 依畫布寬度計算適合不同裝置的移動速度[cite: 3]

  // 維持角色高度為畫布高度的 1/3，寬度依原圖寬高比等比例縮放[cite: 3]
  const characterScale = (height / 3) / frameHeight;
  const characterWidth = frameWidth * characterScale; // 計算角色基本顯示寬度[cite: 3]
  const characterHeight = height / 3;

  if (movingRight) { // 按住右方向鍵[cite: 3]
    isWalking = true; // 切換至走路動畫[cite: 3]
    facingDirection = 1; // 設定角色朝向右方[cite: 3]
    if (characterX < anchorX) {
      characterX = min(anchorX, characterX + movementStep);
    } else if (bgOffsetX > minBgOffset) {
      bgOffsetX = max(minBgOffset, bgOffsetX - movementStep);
    } else {
      characterX += movementStep; // 讓角色向右移動[cite: 3]
    }
  } else if (movingLeft) { // 按住左方向鍵[cite: 3]
    isWalking = true; // 切換至走路動畫[cite: 3]
    facingDirection = -1; // 設定角色朝向左方[cite: 3]
    if (characterX > anchorX) {
      characterX = max(anchorX, characterX - movementStep);
    } else if (bgOffsetX < maxBgOffset) {
      bgOffsetX = min(maxBgOffset, bgOffsetX + movementStep);
    } else {
      characterX -= movementStep; // 讓角色向左移動[cite: 3]
    }
  }

  // 限制角色中心避免超出畫布左右邊界[cite: 3]
  characterX = constrain(characterX, characterWidth / 2, width - characterWidth / 2);

  // 繪製三張左右串接的背景圖片（左、中、右）[cite: 3]
  if (bgImage && bgImage.width > 0) {
    push();
    imageMode(CORNER); // 背景使用左上角座標對齊無縫串接[cite: 3]
    for (let i = -1; i <= 1; i++) {
      const drawX = bgOffsetX + i * singleBgWidth;
      image(bgImage, drawX, 0, singleBgWidth, singleBgHeight);
    }
    pop();
  }

  // 計算角色二位置：最左邊背景圖（i = -1）的水平中點
  const leftmostBgX = bgOffsetX - singleBgWidth;
  const char2X = leftmostBgX + singleBgWidth / 2;

  // 判斷角色一是否接近角色二
  const distanceToChar2 = abs(characterX - char2X);
  char2IsAction = distanceToChar2 < char2TriggerDistance;

  if (char2IsAction !== char2PrevAction) {
    char2FrameCounter = 0;
    char2PrevAction = char2IsAction;
    if (!char2IsAction) {
      selectedOption = null;
    }
  } else {
    char2FrameCounter++;
  }

  // 繪製角色二（位於最左邊背景圖的中間，並根據角色一在左邊或右邊自動轉向）
  const c2Sprite = char2IsAction ? char2ActionClean : char2StopClean;
  const c2FrameCount = char2IsAction ? char2ActionFrameCount : char2StopFrameCount;
  const c2FrameW = char2IsAction ? char2ActionFrameWidth : char2StopFrameWidth;
  const c2FrameH = char2IsAction ? char2ActionFrameHeight : char2StopFrameHeight;

  if (c2Sprite && c2Sprite.width > 0) {
    const c2Scale = characterHeight / c2FrameH;
    const c2DrawW = c2FrameW * c2Scale;
    const c2DrawH = c2FrameH * c2Scale;
    const c2Y = height - c2DrawH / 2;
    const c2FrameIndex = floor(char2FrameCounter / framesPerStep) % c2FrameCount;
    const c2SourceX = c2FrameIndex * c2FrameW;

    // 角色一在角色二左邊時轉向左邊（-1），在右邊時轉向右邊（1）
    // 若角色二精靈圖預設方向相反，可將 -1 與 1 互換
    const char2Facing = characterX < char2X ? -1 : 1;

    push();
    translate(char2X, c2Y);
    scale(char2Facing, 1);
    image(c2Sprite, 0, 0, c2DrawW, c2DrawH, c2SourceX, 0, c2FrameW, c2FrameH);
    pop();
  }

  // 角色一施法與動畫繪製[cite: 3]
  if (isCasting && frameCount - magicStartFrame >= magicFrameCount * framesPerStep) { // 檢查施法動畫是否已完整播放一次[cite: 3]
    isCasting = false; // 結束施法動畫並恢復一般角色動作[cite: 3]
    activeEffects.push({
      x: characterX + magicDirection * characterWidth / 2,
      y: height - characterHeight * 0.58,
      direction: magicDirection
    }); // 在角色前方建立朝施法方向飛行的特效[cite: 3]
  }

  const activeSprite = isCasting ? magicSprite : isWalking ? walkSprite : characterSprite; // 根據角色狀態選擇施法、走路或站立精靈圖[cite: 3]
  const activeFrameCount = isCasting ? magicFrameCount : isWalking ? walkFrameCount : frameCountInSprite; // 取得目前精靈圖的影格總數[cite: 3]
  const activeFrameWidth = isCasting ? magicFrameWidth : isWalking ? walkFrameWidth : frameWidth; // 取得目前精靈圖每格的寬度[cite: 3]
  const activeFrameHeight = isCasting ? magicFrameHeight : isWalking ? walkFrameHeight : frameHeight; // 取得目前精靈圖每格的高度[cite: 3]
  const elapsedMagicFrames = frameCount - magicStartFrame; // 計算施法動畫已播放的畫面數[cite: 3]
  const frameIndex = isCasting
    ? floor(elapsedMagicFrames / framesPerStep)
    : floor(frameCount / framesPerStep) % activeFrameCount; // 計算目前要顯示的精靈影格[cite: 3]
  const sourceX = frameIndex * activeFrameWidth; // 計算目前影格在精靈圖中的水平起點[cite: 3]
  const activeWidth = activeFrameWidth * characterScale; // 計算目前角色影格的顯示寬度[cite: 3]
  const activeHeight = activeFrameHeight * characterScale; // 計算目前角色影格的顯示高度[cite: 3]
  const characterY = height - activeHeight / 2; // 將目前角色影格底部對齊畫布底部[cite: 3]

  if (activeSprite && activeSprite.width > 0) {
    push(); // 暫存目前的繪圖座標轉換狀態[cite: 3]
    translate(characterX, characterY); // 將繪圖原點移至角色中心[cite: 3]
    scale(isCasting ? magicDirection : facingDirection, 1); // 依施法或角色朝向決定是否水平翻轉[cite: 3]
    image(activeSprite, 0, 0, activeWidth, activeHeight, sourceX, 0, activeFrameWidth, activeFrameHeight); // 裁切並繪製目前角色影格[cite: 3]
    pop(); // 還原繪圖座標轉換狀態[cite: 3]
  }

  // 更新與繪製飛行中的魔法特效[cite: 3]
  const effectScale = characterScale; // 使用角色縮放倍率讓特效適應不同畫布[cite: 3]
  const effectWidth = effectFrameWidth * effectScale; // 計算特效影格的顯示寬度[cite: 3]
  const effectHeight = effectFrameHeight * effectScale; // 計算特效影格的顯示高度[cite: 3]
  const effectSpeed = max(6, width * 0.008); // 依畫布寬度計算特效飛行速度[cite: 3]
  for (let effectIndex = activeEffects.length - 1; effectIndex >= 0; effectIndex--) { // 由後往前更新所有飛行中的特效[cite: 3]
    const effect = activeEffects[effectIndex]; // 取得目前更新的特效資料[cite: 3]
    effect.x += effect.direction * effectSpeed; // 依特效方向更新水平位置[cite: 3]
    if (effect.x > width || effect.x < 0) { // 判斷特效是否已抵達畫布左右邊緣[cite: 3]
      activeEffects.splice(effectIndex, 1); // 移除已飛出畫布的特效[cite: 3]
      continue; // 略過已移除特效的繪製[cite: 3]
    }
    const effectFrameIndex = floor(frameCount / framesPerStep) % effectFrameCount; // 計算特效目前播放的影格[cite: 3]
    if (magicEffectSprite && magicEffectSprite.width > 0) {
      push(); // 暫存目前的繪圖座標轉換狀態[cite: 3]
      translate(effect.x, effect.y); // 將繪圖原點移至特效中心[cite: 3]
      scale(effect.direction, 1); // 依飛行方向翻轉特效影格[cite: 3]
      image(
        magicEffectSprite,
        0,
        0,
        effectWidth,
        effectHeight,
        effectFrameIndex * effectFrameWidth,
        0,
        effectFrameWidth,
        effectFrameHeight
      ); // 裁切並繪製目前特效影格[cite: 3]
      pop(); // 還原繪圖座標轉換狀態[cite: 3]
    }
  }

  // 當角色一接近角色二時，在畫布上方顯示透明度 90 的白色英文單字問答方框
  optionHitboxes = [];
  if (char2IsAction) {
    drawQuizBox();
  }
}

function drawQuizBox() {
  const boxW = width / 3; // 寬為整個畫布的 1/3
  const boxH = height / 2; // 高為整個畫布的 1/2
  const boxX = (width - boxW) / 2; // 方框中間對準畫布的中間
  const boxY = max(12, height * 0.02); // 方框上方靠近畫布上方

  push();
  fill(255, 255, 255, 90);
  stroke(255, 255, 255, 200);
  strokeWeight(2);
  rect(boxX, boxY, boxW, boxH, 14);

  const paddingX = boxW * 0.06;
  const innerW = boxW - paddingX * 2;
  const centerX = boxX + boxW / 2;

  const titleSize = constrain(min(boxW * 0.055, boxH * 0.075), 14, 22);
  const questionSize = constrain(min(boxW * 0.048, boxH * 0.068), 13, 20);
  const optionSize = constrain(min(boxW * 0.044, boxH * 0.062), 12, 18);

  let cursorY = boxY + boxH * 0.06;

  // 標題置中
  noStroke();
  fill(20, 20, 20);
  textAlign(CENTER, TOP);
  textSize(titleSize);
  textStyle(BOLD);
  text(englishQuiz.prompt, centerX, cursorY);

  // 題目置中
  cursorY += titleSize * 1.6;
  textSize(questionSize);
  textStyle(NORMAL);
  textAlign(CENTER, TOP);
  text(englishQuiz.question, centerX, cursorY);

  // 選項區域
  cursorY += questionSize * 2.0;
  const bottomReserve = boxH * 0.14;
  const optionGap = max(8, boxH * 0.025);
  const availableOptionH = max(72, (boxY + boxH - bottomReserve) - cursorY);
  const optionBoxH = max(24, (availableOptionH - optionGap * (englishQuiz.options.length - 1)) / englishQuiz.options.length);

  for (let i = 0; i < englishQuiz.options.length; i++) {
    const optX = boxX + paddingX;
    const optY = cursorY + i * (optionBoxH + optionGap);

    optionHitboxes.push({
      index: i,
      x: optX,
      y: optY,
      w: innerW,
      h: optionBoxH
    });

    if (selectedOption === i) {
      fill(255, 255, 255, 190);
      stroke(40, 40, 40, 220);
      strokeWeight(1.5);
    } else {
      fill(255, 255, 255, 130);
      stroke(80, 80, 80, 140);
      strokeWeight(1);
    }
    rect(optX, optY, innerW, optionBoxH, 8);

    noStroke();
    fill(15, 15, 15);
    textAlign(LEFT, CENTER);
    textStyle(NORMAL);
    textSize(optionSize);
    text(englishQuiz.options[i], optX + 12, optY + optionBoxH / 2);
  }

  // 底部提示 / 作答回饋置中
  const feedbackY = boxY + boxH - boxH * 0.07;
  textAlign(CENTER, CENTER);
  textSize(max(12, optionSize * 0.9));
  textStyle(BOLD);
  if (selectedOption === null) {
    fill(30, 30, 30);
    text("請點擊選項或按 1 / 2 / 3 作答", centerX, feedbackY);
  } else if (selectedOption === englishQuiz.answerIndex) {
    fill(0, 120, 40);
    text("答對了！Great job!", centerX, feedbackY);
  } else {
    fill(180, 30, 30);
    text("再試一次！提示：紅色的水果", centerX, feedbackY);
  }

  pop();
}

function mousePressed() {
  if (!char2IsAction) return;

  for (const hit of optionHitboxes) {
    if (
      mouseX >= hit.x &&
      mouseX <= hit.x + hit.w &&
      mouseY >= hit.y &&
      mouseY <= hit.y + hit.h
    ) {
      selectedOption = hit.index;
      break;
    }
  }
}

function keyPressed() { // 按下方向鍵時切換角色狀態與朝向[cite: 3]
  if (char2IsAction) {
    if (key === "1") {
      selectedOption = 0;
      return false;
    }
    if (key === "2") {
      selectedOption = 1;
      return false;
    }
    if (key === "3") {
      selectedOption = 2;
      return false;
    }
  }

  if (keyCode === RIGHT_ARROW) { // 判斷是否按下右方向鍵[cite: 3]
    isWalking = true; // 啟用走路動畫[cite: 3]
    facingDirection = 1; // 讓角色面向右方[cite: 3]
    return false; // 防止方向鍵捲動網頁[cite: 3]
  }
  if (keyCode === LEFT_ARROW) { // 判斷是否按下左方向鍵[cite: 3]
    isWalking = true; // 啟用走路動畫[cite: 3]
    facingDirection = -1; // 讓角色面向左方[cite: 3]
    return false; // 防止方向鍵捲動網頁[cite: 3]
  }
  if (keyCode === 32) { // 判斷是否按下空白鍵[cite: 3]
    if (!spaceIsDown && !isCasting) { // 僅在空白鍵新按下且角色未施法時觸發[cite: 3]
      isCasting = true; // 開始播放施法動畫[cite: 3]
      magicStartFrame = frameCount; // 記錄施法動畫的起始畫面[cite: 3]
      magicDirection = facingDirection; // 鎖定施法當下角色面向[cite: 3]
    }
    spaceIsDown = true; // 記錄空白鍵已按住以避免連續觸發[cite: 3]
    return false; // 防止空白鍵捲動網頁[cite: 3]
  }
}

function keyReleased() { // 鍵盤按鍵放開時更新按鍵狀態[cite: 3]
  if (keyCode === 32) { // 判斷放開的是否為空白鍵[cite: 3]
    spaceIsDown = false; // 允許下次按空白鍵重新施法[cite: 3]
  }
}

function windowResized() { // 視窗尺寸改變時重新調整畫布[cite: 3]
  resizeCanvas(windowWidth, windowHeight); // 將畫布同步為新的視窗尺寸[cite: 3]
  characterX = constrain(characterX, 1, width - 1); // 將角色位置限制在縮放後畫布內[cite: 3]
}