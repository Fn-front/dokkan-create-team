type SkillCondition = {
  type: string
  target: string
  ki?: number
  hp?: number
  atk?: number
  def?: number
}

type Skill = {
  name: string
  conditions?: SkillCondition[]
  original_effect?: string
  effect?: string
}

type SkillSet = {
  leader_skill: Skill
  super_attack: Skill
  ultra_super_attack?: Skill
  passive_skill: Skill
  active_skill: Skill | null
}

export type CharacterSkills = {
  pre_extreme?: SkillSet
  post_extreme?: SkillSet
  super_extreme?: SkillSet
}

export type Character = {
  id: string
  name: string
  imagePath: string
  rarity: number
  type: string
  cost: number
  skills?: CharacterSkills
}

export type TeamSlot = {
  character: Character | null
  position: number
}

export type Team = {
  leader: TeamSlot
  members: TeamSlot[]
  friend: TeamSlot
}

export type DragItem = {
  type: 'character'
  character: Character
}
