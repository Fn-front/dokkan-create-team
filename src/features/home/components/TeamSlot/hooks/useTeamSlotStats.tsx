import { useMemo } from 'react'
import type { TeamSlot } from '@/functions/types/team'
import {
  getCharacterSkills,
  getCharacterStats,
  getLeaderSkillFromSlots,
  getFriendSkillFromSlots,
  getPassiveSkill,
} from '@/functions/utils/characterUtils'
import { matchesLeaderSkillCondition } from '@/functions/utils/leaderSkillUtils'
import { countAlliesForAllyCount } from '@/functions/utils/allyCountUtils'
import { collectStatValues } from '@/functions/utils/statBoostUtils'

export const useTeamSlotStats = (
  slot: TeamSlot,
  formIndex: number,
  teamSlots: TeamSlot[]
) => {
  // 55%ステータス計算
  const stats55 = useMemo(() => {
    if (!slot.character) return null

    const leaderSkill = getLeaderSkillFromSlots(teamSlots)
    const friendSkill = getFriendSkillFromSlots(teamSlots)

    const characterStats = getCharacterStats(slot.character, formIndex)
    const stats55 = characterStats?.potential_55
    if (!stats55) return null

    const baseATK = parseInt(stats55.ATK)
    const baseDEF = parseInt(stats55.DEF)

    let atkMultiplier = 0
    let defMultiplier = 0

    // リーダースキルの倍率取得（条件チェック付き）
    if (leaderSkill?.conditions) {
      for (const condition of leaderSkill.conditions) {
        if (matchesLeaderSkillCondition(slot.character, condition)) {
          if (condition.atk !== undefined) atkMultiplier += condition.atk
          if (condition.def !== undefined) defMultiplier += condition.def
        }
      }
    }

    // フレンドスキルの倍率取得（条件チェック付き）
    if (friendSkill?.conditions) {
      for (const condition of friendSkill.conditions) {
        if (matchesLeaderSkillCondition(slot.character, condition)) {
          if (condition.atk !== undefined) atkMultiplier += condition.atk
          if (condition.def !== undefined) defMultiplier += condition.def
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
    const passiveSkill = getPassiveSkill(slot.character, formIndex)

    let finalATK = currentATK
    let finalDEF = currentDEF

    if (passiveSkill?.stat_boosts) {
      const boosts = passiveSkill.stat_boosts

      const countAllies = (condition: {
        type: string
        targets: string[]
        select: string
      }) => countAlliesForAllyCount(condition, teamSlots)

      // ATK計算
      const atkBoostSum = collectStatValues(
        boosts,
        'atk',
        true,
        false,
        '',
        countAllies
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

      // DEF計算
      const defBoostSum = collectStatValues(
        boosts,
        'def',
        true,
        false,
        '',
        countAllies
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
        false,
        '',
        countAllies
      )
      if (defDownSum > 0) {
        finalDEF -= Math.floor(currentDEF * defDownSum)
      }
    }

    // ultra_super_attackがある_extremeキーから攻撃倍率を取得
    const getAttackMultiplier = () => {
      if (!slot.character) return null
      const skills = getCharacterSkills(slot.character, formIndex)
      if (!skills) return null
      const extremeKeys = Object.keys(skills).filter((key) =>
        key.endsWith('_extreme')
      )

      if (extremeKeys.length === 0) return null

      for (let i = extremeKeys.length - 1; i >= 0; i--) {
        const extremeKey = extremeKeys[i]
        const skillSet = skills[extremeKey as keyof typeof skills]

        if (skillSet && skillSet.ultra_super_attack?.multiplier) {
          return skillSet.ultra_super_attack.multiplier
        }
      }

      return null
    }

    const attackMultiplier = getAttackMultiplier()
    if (attackMultiplier) {
      finalATK = Math.floor(finalATK * attackMultiplier)
    }

    return { atk: finalATK, def: finalDEF }
  }, [slot, formIndex, teamSlots])

  // 100%ステータス計算
  const stats100 = useMemo(() => {
    if (!slot.character) return null

    const leaderSkill = getLeaderSkillFromSlots(teamSlots)
    const friendSkill = getFriendSkillFromSlots(teamSlots)

    const characterStats = getCharacterStats(slot.character, formIndex)
    const stats100 = characterStats?.potential_100
    if (!stats100) return null

    const baseATK = parseInt(stats100.ATK)
    const baseDEF = parseInt(stats100.DEF)

    let atkMultiplier = 0
    let defMultiplier = 0

    // リーダースキルの倍率取得（条件チェック付き）
    if (leaderSkill?.conditions) {
      for (const condition of leaderSkill.conditions) {
        if (matchesLeaderSkillCondition(slot.character, condition)) {
          if (condition.atk !== undefined) atkMultiplier += condition.atk
          if (condition.def !== undefined) defMultiplier += condition.def
        }
      }
    }

    // フレンドスキルの倍率取得（条件チェック付き）
    if (friendSkill?.conditions) {
      for (const condition of friendSkill.conditions) {
        if (matchesLeaderSkillCondition(slot.character, condition)) {
          if (condition.atk !== undefined) atkMultiplier += condition.atk
          if (condition.def !== undefined) defMultiplier += condition.def
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
    const passiveSkill = getPassiveSkill(slot.character, formIndex)

    let finalATK = currentATK
    let finalDEF = currentDEF

    if (passiveSkill?.stat_boosts) {
      const boosts = passiveSkill.stat_boosts

      const countAllies = (condition: {
        type: string
        targets: string[]
        select: string
      }) => countAlliesForAllyCount(condition, teamSlots)

      // ATK計算
      const atkBoostSum = collectStatValues(
        boosts,
        'atk',
        true,
        false,
        '',
        countAllies
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

      // DEF計算
      const defBoostSum = collectStatValues(
        boosts,
        'def',
        true,
        false,
        '',
        countAllies
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
        false,
        '',
        countAllies
      )
      if (defDownSum > 0) {
        finalDEF -= Math.floor(currentDEF * defDownSum)
      }
    }

    // ultra_super_attackがある_extremeキーから攻撃倍率を取得
    const getAttackMultiplier = () => {
      if (!slot.character) return null
      const skills = getCharacterSkills(slot.character, formIndex)
      if (!skills) return null
      const extremeKeys = Object.keys(skills).filter((key) =>
        key.endsWith('_extreme')
      )

      if (extremeKeys.length === 0) return null

      for (let i = extremeKeys.length - 1; i >= 0; i--) {
        const extremeKey = extremeKeys[i]
        const skillSet = skills[extremeKey as keyof typeof skills]

        if (skillSet && skillSet.ultra_super_attack?.multiplier) {
          return skillSet.ultra_super_attack.multiplier
        }
      }

      return null
    }

    const attackMultiplier = getAttackMultiplier()
    if (attackMultiplier) {
      finalATK = Math.floor(finalATK * attackMultiplier)
    }

    return { atk: finalATK, def: finalDEF }
  }, [slot, formIndex, teamSlots])

  // 必殺回数取得
  const superAttackCount = useMemo(() => {
    if (!slot.character) return 0

    const skills = getCharacterSkills(slot.character, formIndex)
    if (skills?.super_extreme?.super_attack?.super_attack_count)
      return skills.super_extreme.super_attack.super_attack_count
    if (skills?.post_extreme?.super_attack?.super_attack_count)
      return skills.post_extreme.super_attack.super_attack_count
    if (skills?.pre_extreme?.super_attack?.super_attack_count)
      return skills.pre_extreme.super_attack.super_attack_count
    return 0
  }, [slot, formIndex])

  // 行動後ステータス計算
  const statsAfterAction = useMemo(() => {
    if (!slot.character) return null

    const leaderSkill = getLeaderSkillFromSlots(teamSlots)
    const friendSkill = getFriendSkillFromSlots(teamSlots)

    const characterStats = getCharacterStats(slot.character, formIndex)
    const stats100 = characterStats?.potential_100
    if (!stats100) return null

    const baseATK = parseInt(stats100.ATK)
    const baseDEF = parseInt(stats100.DEF)

    let atkMultiplier = 0
    let defMultiplier = 0

    // リーダースキルの倍率取得（条件チェック付き）
    if (leaderSkill?.conditions) {
      for (const condition of leaderSkill.conditions) {
        if (matchesLeaderSkillCondition(slot.character, condition)) {
          if (condition.atk !== undefined) atkMultiplier += condition.atk
          if (condition.def !== undefined) defMultiplier += condition.def
        }
      }
    }

    // フレンドスキルの倍率取得（条件チェック付き）
    if (friendSkill?.conditions) {
      for (const condition of friendSkill.conditions) {
        if (matchesLeaderSkillCondition(slot.character, condition)) {
          if (condition.atk !== undefined) atkMultiplier += condition.atk
          if (condition.def !== undefined) defMultiplier += condition.def
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
    const passiveSkill = getPassiveSkill(slot.character, formIndex)

    let finalATK = currentATK
    let finalDEF = currentDEF

    if (passiveSkill?.stat_boosts) {
      const boosts = passiveSkill.stat_boosts

      const countAllies = (condition: {
        type: string
        targets: string[]
        select: string
      }) => countAlliesForAllyCount(condition, teamSlots)

      // ATK計算（conditions含む）
      const atkBoostSum = collectStatValues(
        boosts,
        'atk',
        true,
        true,
        '',
        countAllies
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

      // DEF計算（conditions含む）
      const defBoostSum = collectStatValues(
        boosts,
        'def',
        true,
        true,
        '',
        countAllies
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
        true,
        '',
        countAllies
      )
      if (defDownSum > 0) {
        finalDEF -= Math.floor(currentDEF * defDownSum)
      }
    }

    // super_attack_countとstat_boostを取得
    const skills = getCharacterSkills(slot.character, formIndex)
    const superAttackInfo = (() => {
      if (skills?.super_extreme?.super_attack)
        return skills.super_extreme.super_attack
      if (skills?.post_extreme?.super_attack)
        return skills.post_extreme.super_attack
      if (skills?.pre_extreme?.super_attack)
        return skills.pre_extreme.super_attack
      return null
    })()

    const ultraSuperAttackInfo = (() => {
      if (skills?.super_extreme?.ultra_super_attack)
        return skills.super_extreme.ultra_super_attack
      if (skills?.post_extreme?.ultra_super_attack)
        return skills.post_extreme.ultra_super_attack
      if (skills?.pre_extreme?.ultra_super_attack)
        return skills.pre_extreme.ultra_super_attack
      return null
    })()

    const isLR = slot.character.rarity === 'LR'

    if (isLR && superAttackInfo?.super_attack_count) {
      const count = superAttackInfo.super_attack_count
      const statBoost = superAttackInfo.stat_boost
      const superMultiplier = superAttackInfo.multiplier || 0
      const ultraMultiplier = ultraSuperAttackInfo?.multiplier || 0

      const ultraATK = Math.floor(finalATK * ultraMultiplier)
      const superATK = Math.floor(finalATK * superMultiplier * count)

      let boostATK = 0
      if (statBoost?.atk) {
        const perAttackBoost = Math.floor(baseATK * statBoost.atk)
        boostATK = Math.floor(perAttackBoost * statBoost.atk) * count
      }

      finalATK = ultraATK + superATK + boostATK

      if (statBoost?.atk) {
        const defBoost = Math.floor(baseDEF * statBoost.atk * (count + 1))
        finalDEF += defBoost
      }
    } else {
      const attackMultiplier = ultraSuperAttackInfo?.multiplier || null
      if (attackMultiplier) {
        finalATK = Math.floor(finalATK * attackMultiplier)
      }
    }

    return { atk: finalATK, def: finalDEF }
  }, [slot, formIndex, teamSlots])

  return {
    stats55,
    stats100,
    superAttackCount,
    statsAfterAction,
  }
}
