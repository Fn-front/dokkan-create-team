/**
 * パッシブスキルのstat_boostsから特定の値を再帰的に収集
 */
export const collectStatValues = (
  obj: Record<string, unknown>,
  statType: 'atk' | 'def' | 'def_down',
  excludeBasic = false,
  includeConditions = false,
  parentKey = '',
  countAlliesForAllyCount?: (condition: {
    type: string
    targets: string[]
    select: string
  }) => number
): number => {
  let sum = 0

  if (typeof obj === 'object' && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      if (excludeBasic && key === 'basic') {
        continue
      }
      // defensiveは常に除外、conditionsはオプションで除外
      if (key === 'defensive') {
        continue
      }
      if (!includeConditions && key === 'conditions') {
        continue
      }
      // _supportで終わるキーは除外（味方サポート効果）
      if (key.endsWith('_support')) {
        continue
      }

      // ally_count動的計算
      if (
        parentKey === 'ally_count' &&
        key === statType &&
        countAlliesForAllyCount
      ) {
        const perAlly = (value as Record<string, unknown>)?.per_ally
        if (typeof perAlly === 'number') {
          // targetフィールドから条件を作成
          const target = obj.target as string[] | undefined
          if (target && target.length > 0) {
            const condition = {
              type: 'attribute_or_category',
              targets: target,
              select: 'most',
            }
            const allyCount = countAlliesForAllyCount(condition)
            sum += 1.0 + perAlly * allyCount
            continue
          }
        }
      }

      if (key === statType && typeof value === 'number') {
        sum += value
      } else if (typeof value === 'object' && value !== null) {
        sum += collectStatValues(
          value as Record<string, unknown>,
          statType,
          excludeBasic,
          includeConditions,
          key,
          countAlliesForAllyCount
        )
      }
    }
  }

  return sum
}
