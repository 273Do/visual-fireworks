import type p5 from "p5";

let p: p5;
let clusters: Cluster[] = [];

interface Branch {
  angle: number; // 枝の角度
  length: number; //枝の長さ
  maxLength: number; //枝野最大の長さ
}

const generationCount: number = 3; // 世代数

const minLength: number = 20; // 枝の最小の長さ
const maxLength: number = 500; // 枝の最大の長さ
const duration: number = 1000; // 枝が伸びる時間（ミリ秒）
const minBranches: number = 3; //枝の最小数
const maxBranches: number = 10; // 枝の最大数

const colors: string[] = ["#77BEF0", "#B4E50D", "#FF894F", "#ea5bb8"];

/**
 * クラスター花火を表すクラス
 * 円から複数の線が放射状に伸び、その先端からさらにクラスターが生成される
 */
class Cluster {
  x: number;
  y: number;
  generation: number;
  parentAngle: number;
  branches: Branch[];
  startTime: number;
  duration: number;
  numBranches: number;
  childrenCreated: boolean;

  /**
   * Clusterクラスのコンストラクタ
   * @param x - クラスターの中心X座標
   * @param y - クラスターの中心Y座標
   * @param generation - 世代数（0から始まり、3世代まで繰り返す）
   * @param parentAngle - 親クラスターからの角度(枝の角度)
   */
  constructor(x: number, y: number, generation: number, parentAngle = 0) {
    // パラメータを初期化
    this.x = x;
    this.y = y;
    this.generation = generation;
    this.parentAngle = parentAngle;
    this.branches = [];
    this.startTime = p.millis();
    this.duration = duration;
    (this.numBranches =
      Math.floor(Math.random() * (maxBranches - minBranches + 1)) +
      minBranches),
      (this.childrenCreated = false);

    // n本の枝を等間隔に配置
    for (let i = 0; i < this.numBranches; i++) {
      // 枝のデータを作成
      const branch = {
        angle: (p.TWO_PI / this.numBranches) * i,
        length: 0,
        maxLength:
          Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength,
      };

      this.branches.push(branch);
    }
  }

  display() {
    // 中心の円を描画
    p.fill(colors[Math.floor(Math.random() * colors.length)]);
    p.noStroke();
    p.circle(this.x, this.y, 15);

    // 枝（線）を描画
    p.stroke(colors[Math.floor(Math.random() * colors.length)]);
    p.strokeWeight(2);

    for (let branch of this.branches) {
      const endX = this.x + p.cos(branch.angle) * branch.length;
      const endY = this.y + p.sin(branch.angle) * branch.length;
      p.line(this.x, this.y, endX, endY);
    }
  }

  update() {
    const elapsed = p.millis() - this.startTime;
    const progress = p.constrain(elapsed / this.duration, 0, 1);

    // 線を徐々に伸ばす
    for (let branch of this.branches) {
      branch.length = progress * branch.maxLength;
    }

    // 2秒経過後、世代が3未満なら次の世代を作成
    if (
      progress >= 1 &&
      this.generation < generationCount - 1 &&
      !this.childrenCreated
    ) {
      this.childrenCreated = true;
      // 各枝の先端に新しいクラスターを作成
      for (let branch of this.branches) {
        const endX = this.x + p.cos(branch.angle) * branch.length;
        const endY = this.y + p.sin(branch.angle) * branch.length;
        clusters.push(
          new Cluster(endX, endY, this.generation + 1, branch.angle)
        );
      }
    }
  }
}

// グローバルp5インスタンス用の関数
export function initCluster() {
  p = window.p;
  clusters = [];
  clusters.push(new Cluster(p.width / 2, p.height / 2, 0));
}

export function cluster() {
  // すべてのクラスターを更新・描画
  for (let cluster of clusters) {
    cluster.display();
    cluster.update();
  }
}
