import type { Character, CharacterForm, CharacterSkills } from '@/functions/types/team'

/**
 * キャラクターの最初のフォーム（CharacterForm）を取得
 * reversible_formsまたはformsの[0]を返す
 */
export const getFirstForm = (character: Character): CharacterForm | null => {
  if (character.forms && character.forms.length > 0) {
    return character.forms[0]
  }
  return null
}

/**
 * キャラクターのスキル情報を取得
 * reversible_forms[0]のskillsまたはforms[0]のskillsを返す
 */
export const getCharacterSkills = (character: Character): CharacterSkills | null => {
  if (character.reversible_forms && character.reversible_forms.length > 0) {
    return character.reversible_forms[0].skills
  }
  if (character.forms && character.forms.length > 0) {
    return character.forms[0].skills
  }
  return null
}

/**
 * キャラクターの表示名を取得
 * reversible_forms使用時はname、forms使用時はforms[0].display_name
 */
export const getDisplayName = (character: Character): string => {
  if (character.reversible_forms && character.reversible_forms.length > 0) {
    return character.name || ''
  }
  if (character.forms && character.forms.length > 0) {
    return character.forms[0].display_name
  }
  return ''
}

/**
 * キャラクターの画像URLを取得
 * reversible_forms使用時はreversible_forms[0].image_url、forms使用時はforms[0].image_urls[0]
 */
export const getImageUrl = (character: Character): string => {
  if (character.reversible_forms && character.reversible_forms.length > 0) {
    return character.reversible_forms[0].image_url || ''
  }
  if (character.forms && character.forms.length > 0) {
    return character.forms[0].image_urls?.[0] || ''
  }
  return ''
}

/**
 * キャラクターのステータスを取得
 * reversible_forms使用時はstats、forms使用時はforms[0].stats
 */
export const getCharacterStats = (character: Character) => {
  if (character.reversible_forms && character.reversible_forms.length > 0) {
    return character.stats || null
  }
  if (character.forms && character.forms.length > 0) {
    return character.forms[0].stats
  }
  return null
}

/**
 * TeamSlot配列からリーダーのスキルを取得
 */
export const getLeaderSkillFromSlots = (teamSlots: { character: Character | null; position: number }[]) => {
  const leaderSlot = teamSlots.find((s) => s.position === 0)
  if (!leaderSlot?.character) return null

  const skills = getCharacterSkills(leaderSlot.character)
  if (!skills) return null

  if (skills.super_extreme?.leader_skill?.conditions) {
    return skills.super_extreme.leader_skill
  }
  if (skills.post_extreme?.leader_skill?.conditions) {
    return skills.post_extreme.leader_skill
  }
  if (skills.pre_extreme?.leader_skill?.conditions) {
    return skills.pre_extreme.leader_skill
  }
  return null
}

/**
 * TeamSlot配列からフレンドのスキルを取得
 */
export const getFriendSkillFromSlots = (teamSlots: { character: Character | null; position: number }[]) => {
  const friendSlot = teamSlots.find((s) => s.position === 6)
  if (!friendSlot?.character) return null

  const skills = getCharacterSkills(friendSlot.character)
  if (!skills) return null

  if (skills.super_extreme?.leader_skill?.conditions) {
    return skills.super_extreme.leader_skill
  }
  if (skills.post_extreme?.leader_skill?.conditions) {
    return skills.post_extreme.leader_skill
  }
  if (skills.pre_extreme?.leader_skill?.conditions) {
    return skills.pre_extreme.leader_skill
  }
  return null
}

/**
 * キャラクターのパッシブスキルを取得（優先順位: super_extreme > post_extreme > pre_extreme）
 */
export const getPassiveSkill = (character: Character) => {
  const skills = getCharacterSkills(character)
  if (!skills) return null

  if (skills.super_extreme?.passive_skill?.stat_boosts) {
    return skills.super_extreme.passive_skill
  }
  if (skills.post_extreme?.passive_skill?.stat_boosts) {
    return skills.post_extreme.passive_skill
  }
  if (skills.pre_extreme?.passive_skill?.stat_boosts) {
    return skills.pre_extreme.passive_skill
  }
  return null
}
