import type { Character } from '@/functions/types/team'
import { getDisplayName } from './characterUtils'

/**
 * リーダースキル条件に一致するか判定
 */
export const matchesLeaderSkillCondition = (
  character: Character,
  condition: { type: string; target: string[] }
): boolean => {
  const targets = condition.target

  // 属性判定
  if (condition.type === 'attribute') {
    return targets.some((target) => {
      // 「〜属性」パターン（超/極なし）: 超〜 or 極〜 の両方が対象
      // 例: 「力属性」→ 「超力」or「極力」
      if (!target.startsWith('超') && !target.startsWith('極')) {
        const baseAttr = target.replace('属性', '')
        return (
          character.attribute === `超${baseAttr}` ||
          character.attribute === `極${baseAttr}`
        )
      }

      // 「超〜属性」「極〜属性」パターン: 完全一致
      // 例: 「超力属性」→ 「超力」のみ
      const targetAttr = target.replace('属性', '')
      return character.attribute === targetAttr
    })
  }

  // キャラクター名判定
  if (condition.type === 'character') {
    const displayName = getDisplayName(character)

    return targets.some((target) => {
      // 「または」で分割してOR判定（最初に一致したもののみ）
      if (target.includes('または')) {
        const names = target.split('または').map((n) => n.trim())
        // 最初に見つかった名前だけに一致するか判定
        const firstMatchIndex = names.findIndex((name) =>
          displayName.includes(name)
        )
        // 最初の条件のみ一致する場合のみtrue
        if (firstMatchIndex === -1) return false
        // 他の条件に一致しないことを確認
        for (let i = 0; i < names.length; i++) {
          if (i !== firstMatchIndex && displayName.includes(names[i])) {
            return false
          }
        }
        return true
      }

      // 「&」で分割してOR判定（最初に一致したもののみ）
      if (target.includes('&')) {
        const names = target.split('&').map((n) => n.trim())
        const firstMatchIndex = names.findIndex((name) =>
          displayName.includes(name)
        )
        if (firstMatchIndex === -1) return false
        for (let i = 0; i < names.length; i++) {
          if (i !== firstMatchIndex && displayName.includes(names[i])) {
            return false
          }
        }
        return true
      }

      // 通常のキャラクター名判定
      return displayName.includes(target)
    })
  }

  // カテゴリ判定（配列のいずれかに一致すればtrue）
  if (condition.type === 'category') {
    if (!character.categories) return false
    return targets.some((target) => character.categories?.includes(target))
  }

  // 追加カテゴリ判定（配列のいずれかに一致すればtrue）
  if (condition.type === 'additional_category') {
    if (!character.categories) return false
    return targets.some((target) => character.categories?.includes(target))
  }

  return false
}
