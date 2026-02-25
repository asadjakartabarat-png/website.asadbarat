/**
 * Calculate final score using middle 3 values (remove highest and lowest)
 * This implements the new scoring system where:
 * - If 5 juries: remove highest and lowest, sum the middle 3
 * - If 4 juries: remove highest, sum the remaining 3
 * - If 3 juries: sum all 3
 * - If less than 3: sum all available
 */
export function calculateFinalScore(scores: any[]): number {
  if (scores.length === 0) {
    return 0;
  }
  
  if (scores.length < 3) {
    return scores.reduce((sum: number, score: any) => sum + score.total_score, 0);
  }
  
  const sortedScores = scores.map(score => score.total_score).sort((a, b) => a - b);
  
  if (scores.length === 3) {
    return sortedScores.reduce((sum, score) => sum + score, 0);
  }
  
  if (scores.length === 4) {
    return sortedScores.slice(0, -1).reduce((sum, score) => sum + score, 0);
  }
  
  const middleScores = sortedScores.slice(1, -1);
  
  if (middleScores.length > 3) {
    const startIndex = Math.floor((middleScores.length - 3) / 2);
    return middleScores.slice(startIndex, startIndex + 3).reduce((sum, score) => sum + score, 0);
  }
  
  return middleScores.reduce((sum, score) => sum + score, 0);
}

export function getScoringDetails(scores: any[]): {
  usedScores: number[];
  discardedScores: number[];
  finalScore: number;
  method: string;
} {
  if (scores.length === 0) {
    return { usedScores: [], discardedScores: [], finalScore: 0, method: 'No scores available' };
  }
  
  const allScores = scores.map(score => score.total_score);
  const sortedScores = [...allScores].sort((a, b) => a - b);
  
  if (scores.length < 3) {
    return { usedScores: sortedScores, discardedScores: [], finalScore: calculateFinalScore(scores), method: `All ${scores.length} scores used` };
  }
  
  if (scores.length === 3) {
    return { usedScores: sortedScores, discardedScores: [], finalScore: calculateFinalScore(scores), method: 'All 3 scores used' };
  }
  
  if (scores.length === 4) {
    return {
      usedScores: sortedScores.slice(0, -1),
      discardedScores: [sortedScores[sortedScores.length - 1]],
      finalScore: calculateFinalScore(scores),
      method: 'Highest score discarded, 3 lowest used'
    };
  }
  
  const middleScores = sortedScores.slice(1, -1);
  let usedScores: number[];
  
  if (middleScores.length > 3) {
    const startIndex = Math.floor((middleScores.length - 3) / 2);
    usedScores = middleScores.slice(startIndex, startIndex + 3);
  } else {
    usedScores = middleScores;
  }
  
  const discardedScores = sortedScores.filter(score => !usedScores.includes(score));
  
  return { usedScores, discardedScores, finalScore: calculateFinalScore(scores), method: 'Highest and lowest scores discarded, middle 3 used' };
}

export function calculateMiddle3SumForCriteria(scores: any[], criteriaName: string): number {
  if (scores.length === 0) return 0;
  
  const criteriaValues = scores
    .map(score => score.criteria_scores?.[criteriaName] || 0)
    .sort((a, b) => a - b);
  
  if (criteriaValues.length < 3) return criteriaValues.reduce((sum, val) => sum + val, 0);
  if (criteriaValues.length === 3) return criteriaValues.reduce((sum, val) => sum + val, 0);
  if (criteriaValues.length === 4) return criteriaValues.slice(0, -1).reduce((sum, val) => sum + val, 0);
  
  const middleValues = criteriaValues.slice(1, -1);
  if (middleValues.length > 3) {
    const startIndex = Math.floor((middleValues.length - 3) / 2);
    return middleValues.slice(startIndex, startIndex + 3).reduce((sum, val) => sum + val, 0);
  }
  
  return middleValues.reduce((sum, val) => sum + val, 0);
}

export function getMiddle3ValuesForCriteria(scores: any[], criteriaName: string): number[] {
  if (scores.length === 0) return [];
  
  const criteriaValues = scores
    .map(score => score.criteria_scores?.[criteriaName] || 0)
    .sort((a, b) => a - b);
  
  if (criteriaValues.length < 3) return criteriaValues;
  if (criteriaValues.length === 3) return criteriaValues;
  if (criteriaValues.length === 4) return criteriaValues.slice(0, -1);
  
  const middleValues = criteriaValues.slice(1, -1);
  if (middleValues.length > 3) {
    const startIndex = Math.floor((middleValues.length - 3) / 2);
    return middleValues.slice(startIndex, startIndex + 3);
  }
  
  return middleValues;
}

export function getMiddle3Juries(scores: any[]): string[] {
  if (scores.length === 0) return [];
  
  const sortedScores = [...scores].sort((a, b) => a.total_score - b.total_score);
  
  if (sortedScores.length < 3) return sortedScores.map(s => s.juri_name);
  if (sortedScores.length === 3) return sortedScores.map(s => s.juri_name);
  if (sortedScores.length === 4) return sortedScores.slice(0, -1).map(s => s.juri_name);
  
  const middleScores = sortedScores.slice(1, -1);
  if (middleScores.length > 3) {
    const startIndex = Math.floor((middleScores.length - 3) / 2);
    return middleScores.slice(startIndex, startIndex + 3).map(s => s.juri_name);
  }
  
  return middleScores.map(s => s.juri_name);
}

export function getMiddle3JuriesForCriteria(scores: any[], criteriaName: string): { juri: string; value: number }[] {
  const middle3Juries = getMiddle3Juries(scores);
  
  return scores
    .filter(score => middle3Juries.includes(score.juri_name))
    .map(score => ({ juri: score.juri_name, value: score.criteria_scores?.[criteriaName] || 0 }))
    .sort((a, b) => a.value - b.value);
}

export function getTieBreakerPriority(kategori: string): string[] {
  const priorities: Record<string, string[]> = {
    'PERORANGAN': ['ORISINALITAS', 'KEMANTAPAN', 'STAMINA'],
    'ATT': ['ORISINALITAS', 'KEMANTAPAN', 'KEKAYAAAN TEKNIK'],
    'BERKELOMPOK': ['ORISINALITAS', 'KEMANTAPAN', 'KEKOMPAKAN'],
    'MASAL': ['ORISINALITAS', 'KEMANTAPAN', 'KEKOMPAKAN', 'KREATIFITAS'],
    'BERPASANGAN': ['TEKNIK SERANG BELA', 'KEMANTAPAN', 'PENGHAYATAN']
  };
  
  return priorities[kategori] || [];
}

export function applyTieBreaker(
  resultA: { finalScore: number; scores: any[] },
  resultB: { finalScore: number; scores: any[] },
  kategori: string
): number {
  if (resultA.finalScore !== resultB.finalScore) {
    return resultB.finalScore - resultA.finalScore;
  }
  
  const priorities = getTieBreakerPriority(kategori);
  
  for (const criteria of priorities) {
    const sumA = calculateMiddle3SumForCriteria(resultA.scores, criteria);
    const sumB = calculateMiddle3SumForCriteria(resultB.scores, criteria);
    if (sumA !== sumB) return sumB - sumA;
  }
  
  return 0;
}

export function sortWithTieBreaker<T extends { finalScore: number; scores: any[] }>(
  results: T[],
  kategori: string
): (T & { rank: number })[] {
  const sorted = [...results].sort((a, b) => applyTieBreaker(a, b, kategori));
  
  let currentRank = 1;
  return sorted.map((result, index) => {
    if (index > 0) {
      const comparison = applyTieBreaker(result, sorted[index - 1], kategori);
      if (comparison !== 0) currentRank = index + 1;
    }
    return { ...result, rank: currentRank };
  });
}
