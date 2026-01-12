export interface DecodedScore {
  myScore: number;
  opponentScore: number;
}

export function decodeScore(encodedScore: number, side: number): DecodedScore {
  const leftScore = encodedScore & 0b1111;
  const rightScore = encodedScore >> 4;

  // Si on est côté droit, inverser
  if (side === 1) {
    return { myScore: rightScore, opponentScore: leftScore };
  }
  return { myScore: leftScore, opponentScore: rightScore };
}
