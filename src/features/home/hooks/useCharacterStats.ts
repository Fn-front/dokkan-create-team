import { useMemo } from 'react'
import type {
  Character,
  TeamSlot,
  CharacterSkills,
} from '@/functions/types/team'
import {
  getCharacterSkills,
  getCharacterStats,
  getLeaderSkillFromSlots,
  getFriendSkillFromSlots,
  getPassiveSkill as getPassiveSkillUtil,
} from '@/functions/utils/characterUtils'
import { matchesLeaderSkillCondition } from '@/functions/utils/leaderSkillUtils'
import { collectStatValues } from '@/functions/utils/statBoostUtils'

type StatsResult = {
  hp: number
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
 * リーダー・フレンドスキルを取得
 */
const getLeaderAndFriendSkills = (teamSlots: TeamSlot[]) => {
  return {
    leaderSkill: getLeaderSkillFromSlots(teamSlots),
    friendSkill: getFriendSkillFromSlots(teamSlots),
  }
}

/**
 * 攻撃倍率を取得
 */
const getAttackMultiplier = (skills: CharacterSkills) => {
  if (
    skills.super_extreme?.ultra_super_attack !== null &&
    skills.super_extreme?.ultra_super_attack !== undefined
  )
    return skills.super_extreme.ultra_super_attack.multiplier || null
  if (
    skills.post_extreme?.ultra_super_attack !== null &&
    skills.post_extreme?.ultra_super_attack !== undefined
  )
    return skills.post_extreme.ultra_super_attack.multiplier || null
  if (
    skills.pre_extreme?.ultra_super_attack !== null &&
    skills.pre_extreme?.ultra_super_attack !== undefined
  )
    return skills.pre_extreme.ultra_super_attack.multiplier || null
  return null
}

/**
 * super_attack情報を取得
 */
const getSuperAttackInfo = (skills: CharacterSkills) => {
  if (
    skills.super_extreme?.super_attack !== null &&
    skills.super_extreme?.super_attack !== undefined
  )
    return skills.super_extreme.super_attack
  if (
    skills.post_extreme?.super_attack !== null &&
    skills.post_extreme?.super_attack !== undefined
  )
    return skills.post_extreme.super_attack
  if (
    skills.pre_extreme?.super_attack !== null &&
    skills.pre_extreme?.super_attack !== undefined
  )
    return skills.pre_extreme.super_attack
  return null
}

/**
 * ultra_super_attack情報を取得
 */
const getUltraSuperAttackInfo = (skills: CharacterSkills) => {
  if (
    skills.super_extreme?.ultra_super_attack !== null &&
    skills.super_extreme?.ultra_super_attack !== undefined
  )
    return skills.super_extreme.ultra_super_attack
  if (
    skills.post_extreme?.ultra_super_attack !== null &&
    skills.post_extreme?.ultra_super_attack !== undefined
  )
    return skills.post_extreme.ultra_super_attack
  if (
    skills.pre_extreme?.ultra_super_attack !== null &&
    skills.pre_extreme?.ultra_super_attack !== undefined
  )
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
    const characterStats = getCharacterStats(character)
    const characterSkills = getCharacterSkills(character)

    if (!characterStats || !characterSkills) {
      return { hp: 0, atk: 0, def: 0 }
    }

    const { leaderSkill, friendSkill } = getLeaderAndFriendSkills(teamSlots)

    const stats = characterStats[potential]

    if (!stats) {
      return { hp: 0, atk: 0, def: 0 }
    }

    const baseATK = parseInt(stats.ATK)
    const baseDEF = parseInt(stats.DEF)

    // リーダースキル適用後の基本ステータス計算（リーダー + フレンド の加算）
    let currentATK = baseATK
    let currentDEF = baseDEF
    const baseHP = parseInt(stats.HP)

    // リーダースキルの倍率を加算で適用（全条件をチェックして加算）
    let leaderAtkMultiplier = 0
    let leaderDefMultiplier = 0
    let leaderHpMultiplier = 0

    if (leaderSkill?.conditions) {
      for (const condition of leaderSkill.conditions) {
        if (matchesLeaderSkillCondition(character, condition)) {
          if (condition.atk !== undefined) leaderAtkMultiplier += condition.atk
          if (condition.def !== undefined) leaderDefMultiplier += condition.def
          if (condition.hp !== undefined) leaderHpMultiplier += condition.hp
        }
      }
    }

    let friendAtkMultiplier = 0
    let friendDefMultiplier = 0
    let friendHpMultiplier = 0

    if (friendSkill?.conditions) {
      for (const condition of friendSkill.conditions) {
        if (matchesLeaderSkillCondition(character, condition)) {
          if (condition.atk !== undefined) friendAtkMultiplier += condition.atk
          if (condition.def !== undefined) friendDefMultiplier += condition.def
          if (condition.hp !== undefined) friendHpMultiplier += condition.hp
        }
      }
    }

    const totalAtkMultiplier = leaderAtkMultiplier + friendAtkMultiplier
    const totalDefMultiplier = leaderDefMultiplier + friendDefMultiplier
    const totalHpMultiplier = leaderHpMultiplier + friendHpMultiplier

    // HP計算（-1処理適用）
    const finalHP =
      totalHpMultiplier > 0
        ? Math.floor(baseHP * (totalHpMultiplier - 1))
        : baseHP

    if (totalAtkMultiplier > 0) {
      currentATK = Math.floor(baseATK * totalAtkMultiplier)
    }

    if (totalDefMultiplier > 0) {
      currentDEF = Math.floor(baseDEF * totalDefMultiplier)
    }

    // パッシブスキルのstat_boosts計算
    const passiveSkill = getPassiveSkillUtil(character)

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
          finalATK = basicATK + Math.floor(basicATK * (atkBoostSum - 1))
        } else {
          finalATK = basicATK
        }
      } else if (atkBoostSum > 0) {
        finalATK = Math.floor(currentATK * atkBoostSum)
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
          finalDEF = basicDEF + Math.floor(basicDEF * (defBoostSum - 1))
        } else {
          finalDEF = basicDEF
        }
      } else if (defBoostSum > 0) {
        finalDEF = Math.floor(currentDEF * defBoostSum)
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

    return { hp: finalHP, atk: finalATK, def: finalDEF }
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
    const characterSkills = getCharacterSkills(character)
    if (!characterSkills) return baseStats

    const attackMultiplier = getAttackMultiplier(characterSkills)
    let finalATK = baseStats.atk

    if (attackMultiplier) {
      finalATK = Math.floor(finalATK * attackMultiplier)
    }

    return { hp: baseStats.hp, atk: finalATK, def: baseStats.def }
  }, [character, baseStats])
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
    const characterSkills = getCharacterSkills(character)
    const characterStats = getCharacterStats(character)
    if (!characterSkills || !characterStats) return baseStats

    const superAttackInfo = getSuperAttackInfo(characterSkills)
    const ultraSuperAttackInfo = getUltraSuperAttackInfo(characterSkills)
    const isLR = character.rarity === 'LR'

    if (!isLR || !superAttackInfo?.super_attack_count) {
      // LR以外: 通常の計算式
      const attackMultiplier = ultraSuperAttackInfo?.multiplier || null
      let finalATK = baseStats.atk

      if (attackMultiplier) {
        finalATK = Math.floor(finalATK * attackMultiplier)
      }

      return { hp: baseStats.hp, atk: finalATK, def: baseStats.def }
    }

    // LRの場合: 特殊な計算式
    const count = superAttackInfo.super_attack_count
    const statBoost = superAttackInfo.stat_boost
    const superMultiplier = superAttackInfo.multiplier || 0
    const ultraMultiplier = ultraSuperAttackInfo?.multiplier || 0
    const stats100 = characterStats.potential_100
    if (!stats100) return baseStats
    const baseATK = parseInt(stats100.ATK)
    const baseDEF = parseInt(stats100.DEF)

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

    return { hp: baseStats.hp, atk: finalATK, def: finalDEF }
  }, [character, baseStats])
}

/**
 * super_attack_count を取得
 */
export const useSuperAttackCount = (
  skills: CharacterSkills | undefined
): number => {
  return useMemo(() => {
    if (!skills) return 0

    const superAttackInfo = getSuperAttackInfo(skills)
    return superAttackInfo?.super_attack_count || 0
  }, [skills])
}
