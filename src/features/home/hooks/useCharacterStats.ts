import { useMemo } from 'react'
import type { Character, TeamSlot } from '@/functions/types/team'

type StatsResult = {
  atk: number
  def: number
}

type UseCharacterStatsProps = {
  character: Character
  teamSlots: TeamSlot[]
  potential: 'potential_55' | 'potential_100'
  includeConditions?: boolean
}

/**
 * basic以外の全ATK/DEF値を再帰的に検索して合計
 */
const collectStatValues = (
  obj: Record<string, unknown>,
  statType: 'atk' | 'def' | 'def_down',
  excludeBasic = false,
  includeConditions = false
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

      if (key === statType && typeof value === 'number') {
        sum += value
      } else if (typeof value === 'object' && value !== null) {
        sum += collectStatValues(
          value as Record<string, unknown>,
          statType,
          false,
          includeConditions
        )
      }
    }
  }

  return sum
}

/**
 * リーダースキル条件に一致するか判定
 */
const matchesLeaderSkillCondition = (
  character: Character,
  condition: { type: string; target: string }
): boolean => {
  // 属性判定
  if (condition.type === 'attribute') {
    const target = condition.target

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
  }

  // キャラクター名判定
  if (condition.type === 'character') {
    const target = condition.target

    // 「または」で分割してOR判定（最初に一致したもののみ）
    if (target.includes('または')) {
      const names = target.split('または').map((n) => n.trim())
      // 最初に見つかった名前だけに一致するか判定
      const firstMatchIndex = names.findIndex((name) =>
        character.name.includes(name)
      )
      // 最初の条件のみ一致する場合のみtrue
      if (firstMatchIndex === -1) return false
      // 他の条件に一致しないことを確認
      for (let i = 0; i < names.length; i++) {
        if (i !== firstMatchIndex && character.name.includes(names[i])) {
          return false
        }
      }
      return true
    }

    // 「&」で分割してOR判定（最初に一致したもののみ）
    if (target.includes('&')) {
      const names = target.split('&').map((n) => n.trim())
      const firstMatchIndex = names.findIndex((name) =>
        character.name.includes(name)
      )
      if (firstMatchIndex === -1) return false
      for (let i = 0; i < names.length; i++) {
        if (i !== firstMatchIndex && character.name.includes(names[i])) {
          return false
        }
      }
      return true
    }

    // 通常のキャラクター名判定
    return character.name.includes(target)
  }

  // カテゴリ判定
  if (condition.type === 'category') {
    if (!character.categories) return false
    return character.categories.includes(condition.target)
  }

  return false
}

/**
 * リーダー・フレンドスキルを取得
 */
const getLeaderAndFriendSkills = (teamSlots: TeamSlot[]) => {
  const leaderSlot = teamSlots.find((s) => s.position === 0)
  const friendSlot = teamSlots.find((s) => s.position === 6)

  const getSkill = (skills: NonNullable<Character['skills']> | undefined) => {
    if (!skills) return null
    if (skills.super_extreme?.leader_skill?.conditions)
      return skills.super_extreme.leader_skill
    if (skills.post_extreme?.leader_skill?.conditions)
      return skills.post_extreme.leader_skill
    if (skills.pre_extreme?.leader_skill?.conditions)
      return skills.pre_extreme.leader_skill
    return null
  }

  return {
    leaderSkill: getSkill(leaderSlot?.character?.skills),
    friendSkill: getSkill(friendSlot?.character?.skills),
  }
}

/**
 * パッシブスキルを取得
 */
const getPassiveSkill = (skills: NonNullable<Character['skills']>) => {
  if (skills.super_extreme?.passive_skill?.stat_boosts)
    return skills.super_extreme.passive_skill
  if (skills.post_extreme?.passive_skill?.stat_boosts)
    return skills.post_extreme.passive_skill
  if (skills.pre_extreme?.passive_skill?.stat_boosts)
    return skills.pre_extreme.passive_skill
  return null
}

/**
 * 攻撃倍率を取得
 */
const getAttackMultiplier = (skills: NonNullable<Character['skills']>) => {
  const extremeKeys = Object.keys(skills).filter((key) =>
    key.endsWith('_extreme')
  )

  if (extremeKeys.length === 0) return null

  const lastExtremeKey = extremeKeys[extremeKeys.length - 1]
  const skillSet = skills[lastExtremeKey as keyof typeof skills]

  if (!skillSet) return null

  return skillSet.ultra_super_attack?.multiplier || null
}

/**
 * super_attack情報を取得
 */
const getSuperAttackInfo = (skills: NonNullable<Character['skills']>) => {
  if (skills.super_extreme?.super_attack)
    return skills.super_extreme.super_attack
  if (skills.post_extreme?.super_attack) return skills.post_extreme.super_attack
  if (skills.pre_extreme?.super_attack) return skills.pre_extreme.super_attack
  return null
}

/**
 * ultra_super_attack情報を取得
 */
const getUltraSuperAttackInfo = (skills: NonNullable<Character['skills']>) => {
  if (skills.super_extreme?.ultra_super_attack)
    return skills.super_extreme.ultra_super_attack
  if (skills.post_extreme?.ultra_super_attack)
    return skills.post_extreme.ultra_super_attack
  if (skills.pre_extreme?.ultra_super_attack)
    return skills.pre_extreme.ultra_super_attack
  return null
}

/**
 * キャラクターのステータスを計算するカスタムフック
 */
export const useCharacterStats = ({
  character,
  teamSlots,
  potential,
  includeConditions = false,
}: UseCharacterStatsProps): StatsResult => {
  return useMemo(() => {
    if (!character.stats || !character.skills) {
      return { atk: 0, def: 0 }
    }

    const { leaderSkill, friendSkill } = getLeaderAndFriendSkills(teamSlots)

    const baseATK = character.stats[potential].ATK
    const baseDEF = character.stats[potential].DEF

    let atkMultiplier = 0
    let defMultiplier = 0

    // リーダースキルの倍率取得（最初に一致した条件のみ適用）
    if (leaderSkill?.conditions) {
      for (const condition of leaderSkill.conditions) {
        const matches = matchesLeaderSkillCondition(character, condition)
        if (matches) {
          if (condition.atk !== undefined) atkMultiplier += condition.atk
          if (condition.def !== undefined) defMultiplier += condition.def
          break // 最初に一致した条件のみ適用
        }
      }
    }

    // フレンドスキルの倍率取得（最初に一致した条件のみ適用）
    if (friendSkill?.conditions) {
      for (const condition of friendSkill.conditions) {
        const matches = matchesLeaderSkillCondition(character, condition)
        if (matches) {
          if (condition.atk !== undefined) atkMultiplier += condition.atk
          if (condition.def !== undefined) defMultiplier += condition.def
          break // 最初に一致した条件のみ適用
        }
      }
    }

    // リーダースキル適用後の基本ステータス計算
    let currentATK = baseATK
    let currentDEF = baseDEF

    if (atkMultiplier > 0) {
      currentATK = Math.floor(baseATK * atkMultiplier)
    }
    if (defMultiplier > 0) {
      currentDEF = Math.floor(baseDEF * defMultiplier)
    }

    // パッシブスキルのstat_boosts計算
    const passiveSkill = getPassiveSkill(character.skills)

    let finalATK = currentATK
    let finalDEF = currentDEF

    if (passiveSkill?.stat_boosts) {
      const boosts = passiveSkill.stat_boosts

      // ATK計算: basic掛け算 → 他の値を足して掛け算
      const atkBoostSum = collectStatValues(
        boosts,
        'atk',
        true,
        includeConditions
      )

      if (boosts.basic?.atk) {
        const basicATK = Math.floor(currentATK * boosts.basic.atk)
        if (atkBoostSum > 0) {
          finalATK = Math.floor(basicATK * (atkBoostSum - 1))
        } else {
          finalATK = basicATK
        }
      } else if (atkBoostSum > 0) {
        finalATK = Math.floor(currentATK * (atkBoostSum - 1))
      }

      // DEF計算: basic掛け算 → 他の値を足して掛け算
      const defBoostSum = collectStatValues(
        boosts,
        'def',
        true,
        includeConditions
      )

      if (boosts.basic?.def) {
        const basicDEF = Math.floor(currentDEF * boosts.basic.def)
        if (defBoostSum > 0) {
          finalDEF = Math.floor(basicDEF * (defBoostSum - 1))
        } else {
          finalDEF = basicDEF
        }
      } else if (defBoostSum > 0) {
        finalDEF = Math.floor(currentDEF * (defBoostSum - 1))
      }

      // DEF down効果
      const defDownSum = collectStatValues(
        boosts,
        'def_down',
        false,
        includeConditions
      )
      if (defDownSum > 0) {
        finalDEF -= Math.floor(currentDEF * defDownSum)
      }
    }

    return { atk: finalATK, def: finalDEF }
  }, [character, teamSlots, potential, includeConditions])
}

/**
 * 通常キャラクターの最終ステータスを計算（multiplier適用）
 */
export const useNormalCharacterFinalStats = ({
  character,
  teamSlots,
  potential,
}: Omit<UseCharacterStatsProps, 'includeConditions'>): StatsResult => {
  const baseStats = useCharacterStats({
    character,
    teamSlots,
    potential,
    includeConditions: false,
  })

  return useMemo(() => {
    if (!character.skills) return baseStats

    const attackMultiplier = getAttackMultiplier(character.skills)
    let finalATK = baseStats.atk

    if (attackMultiplier) {
      finalATK = Math.floor(finalATK * attackMultiplier)
    }

    return { atk: finalATK, def: baseStats.def }
  }, [character.skills, baseStats])
}

/**
 * LRキャラクターの行動後ステータスを計算
 */
export const useLRActionStats = ({
  character,
  teamSlots,
}: {
  character: Character
  teamSlots: TeamSlot[]
}): StatsResult => {
  const baseStats = useCharacterStats({
    character,
    teamSlots,
    potential: 'potential_100',
    includeConditions: true,
  })

  return useMemo(() => {
    if (!character.skills || !character.stats) return baseStats

    const superAttackInfo = getSuperAttackInfo(character.skills)
    const ultraSuperAttackInfo = getUltraSuperAttackInfo(character.skills)
    const isLR = character.rarity === 'LR'

    if (!isLR || !superAttackInfo?.super_attack_count) {
      // LR以外: 通常の計算式
      const attackMultiplier = ultraSuperAttackInfo?.multiplier || null
      let finalATK = baseStats.atk

      if (attackMultiplier) {
        finalATK = Math.floor(finalATK * attackMultiplier)
      }

      return { atk: finalATK, def: baseStats.def }
    }

    // LRの場合: 特殊な計算式
    const count = superAttackInfo.super_attack_count
    const statBoost = superAttackInfo.stat_boost
    const superMultiplier = superAttackInfo.multiplier || 0
    const ultraMultiplier = ultraSuperAttackInfo?.multiplier || 0
    const baseATK = character.stats.potential_100.ATK
    const baseDEF = character.stats.potential_100.DEF

    const ultraATK = Math.floor(baseStats.atk * ultraMultiplier)
    const superATK = Math.floor(baseStats.atk * superMultiplier * count)

    let boostATK = 0
    if (statBoost?.atk) {
      const perAttackBoost = Math.floor(baseATK * statBoost.atk)
      boostATK = Math.floor(perAttackBoost * statBoost.atk) * count
    }

    const finalATK = ultraATK + superATK + boostATK

    // DEF: 基本DEF × stat_boost.atk × 回数を足す
    let finalDEF = baseStats.def
    if (statBoost?.atk) {
      const defBoost = Math.floor(baseDEF * statBoost.atk * (count + 1))
      finalDEF += defBoost
    }

    return { atk: finalATK, def: finalDEF }
  }, [character, baseStats])
}

/**
 * super_attack_count を取得
 */
export const useSuperAttackCount = (
  skills: NonNullable<Character['skills']> | undefined
): number => {
  return useMemo(() => {
    if (!skills) return 0

    const superAttackInfo = getSuperAttackInfo(skills)
    return superAttackInfo?.super_attack_count || 0
  }, [skills])
}
