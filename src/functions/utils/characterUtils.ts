import type {
  Character,
  CharacterForm,
  CharacterSkills,
} from '@/functions/types/team'

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
 * reversible_forms[formIndex]のskillsまたはforms[0]のskillsを返す
 */
export const getCharacterSkills = (
  character: Character,
  formIndex: number = 0
): CharacterSkills | null => {
  if (character.reversible_forms && character.reversible_forms.length > 0) {
    const index = Math.min(formIndex, character.reversible_forms.length - 1)
    return character.reversible_forms[index].skills
  }
  if (character.forms && character.forms.length > 0) {
    return character.forms[0].skills
  }
  return null
}

/**
 * reversible_forms を持つキャラクターかどうか判定
 */
export const isReversibleCharacter = (character: Character): boolean => {
  return !!(character.reversible_forms && character.reversible_forms.length > 1)
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
 * reversible_forms使用時はreversible_forms[formIndex].image_url、forms使用時はforms[0].image_urls[0]
 */
export const getImageUrl = (
  character: Character,
  formIndex: number = 0
): string => {
  if (character.reversible_forms && character.reversible_forms.length > 0) {
    const index = Math.min(formIndex, character.reversible_forms.length - 1)
    return character.reversible_forms[index].image_url || ''
  }
  if (character.forms && character.forms.length > 0) {
    return character.forms[0].image_url || ''
  }
  return ''
}

/**
 * キャラクターのステータスを取得
 * reversible_forms使用時はcharacter.stats、forms使用時はforms[0].stats
 */
export const getCharacterStats = (character: Character) => {
  if (character.reversible_forms && character.reversible_forms.length > 0) {
    // reversible_formsの場合、statsはキャラクターレベルに存在
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
export const getLeaderSkillFromSlots = (
  teamSlots: { character: Character | null; position: number }[]
) => {
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
export const getFriendSkillFromSlots = (
  teamSlots: { character: Character | null; position: number }[]
) => {
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
export const getPassiveSkill = (
  character: Character,
  formIndex: number = 0
) => {
  const skills = getCharacterSkills(character, formIndex)
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
