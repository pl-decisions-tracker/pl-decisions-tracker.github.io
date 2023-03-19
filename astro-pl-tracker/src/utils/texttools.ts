import stringWidth from "string-pixel-width";

export function getTextDivEmSize(text: string): number {
  const p2Px = 10;
  const borderPx = 2
  const settings = {
    font: "tahoma",
    size: 10, // just for simpler division
  };
  // Just supposing Default Segoe is 5% wider than Tahoma, dividig by 10 to get ems, than rounding to the first sign after period
  return Math.round(((stringWidth(text, settings) + p2Px + borderPx)*1.1 / 10) * 10 ) / 10;
}

export function halve(str:string): [string, string] {
    let mid = Math.floor(str.length/2)
    let i = mid - 1, j = mid, sep = 0;
    while(j<str.length && i>=0) {
      if(str[i]===' ') { sep = i + 1; break }
      if(str[j]===' ') { sep = j + 1; break }
      i--
      j++
    }
    return [str.slice(0,sep), str.slice(sep)]
}

export function getLongestHalfSize(str:string): number {
  const [left, right] = halve(str);
  const leftSize = getTextDivEmSize(left);
  const rightSize = getTextDivEmSize(right);
  return leftSize > rightSize ? leftSize : rightSize
}