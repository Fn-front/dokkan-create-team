import type { TeamSlot } from '@/functions/types/team'

/**
 * ally_count条件に合う味方の体数をカウントする
 */
export const countAlliesForAllyCount = (
  condition: {
    type: string
    targets: string[]
    select: string
  },
  teamSlots: TeamSlot[]
): number => {
  if (condition.type === 'attribute_or_category') {
    let attributeCount = 0
    let categoryCount = 0

    teamSlots.forEach((ts) => {
      if (!ts.character) return

      const char = ts.character
      // 属性判定（「超」「極」）
      condition.targets.forEach((target) => {
        if (target === '超' || target === '極') {
          if (char.attribute.startsWith(target)) {
            attributeCount++
          }
        }
        // カテゴリ判定
        else if (char.categories?.includes(target)) {
          categoryCount++
        }
      })
    })

    // "most" = 体数の多い方を返す
    if (condition.select === 'most') {
      return Math.max(attributeCount, categoryCount)
    }
  }
  return 0
}
