import type { CharacterSkills } from '@/functions/types/team'

/**
 * キャラクターのリーダースキルのki条件値を取得する
 * @param skills キャラクターのスキル情報
 * @returns ki条件値（0-24）、条件がない場合は0
 */
export const getLeaderSkillKiValue = (skills: CharacterSkills): number => {
  // 優先順位: super_extreme > post_extreme > pre_extreme
  const skillSets = [
    skills.super_extreme,
    skills.post_extreme,
    skills.pre_extreme,
  ]

  for (const skillSet of skillSets) {
    if (skillSet?.leader_skill?.conditions) {
      // leader_skillのconditionsからki値を探す
      for (const condition of skillSet.leader_skill.conditions) {
        if (condition.ki !== undefined) {
          // ki値を0-24の範囲に制限
          return Math.max(0, Math.min(24, condition.ki))
        }
      }
    }
  }

  return 0
}

/**
 * キャラクターのパッシブスキルのki値を取得する
 * @param skills キャラクターのスキル情報
 * @returns パッシブスキルのki値、条件がない場合は0
 */
export const getPassiveSkillKiValue = (skills: CharacterSkills): number => {
  // 優先順位: super_extreme > post_extreme > pre_extreme
  const skillSets = [
    skills.super_extreme,
    skills.post_extreme,
    skills.pre_extreme,
  ]

  for (const skillSet of skillSets) {
    if (skillSet?.passive_skill?.stat_boosts?.basic?.ki) {
      // ki値を0-24の範囲に制限
      return Math.max(
        0,
        Math.min(24, skillSet.passive_skill.stat_boosts.basic.ki)
      )
    }
  }

  return 0
}
