type SkillCondition = {
  type: string
  target: string
  ki?: number
  hp?: number
  atk?: number
  def?: number
}

type StatBoosts = {
  basic?: {
    atk?: number
    def?: number
    def_down?: number
    ki?: number
  }
  super_attack?: {
    atk?: number
    def?: number
  }
  conditional?: {
    enemy?: {
      atk?: number
      def?: number
    }
  }
  turn_limited?: {
    first_3?: {
      def?: number
    }
  }
  turn_start?: {
    atk?: number
    def?: number
  }
  after_hit?: {
    atk?: number
    def?: number
  }
  ki_meter?: {
    [kiLevel: string]: {
      atk?: number
      def?: number
    }
  }
}

type Skill = {
  name: string
  conditions?: SkillCondition[]
  original_effect?: string
  effect?: string
  stat_boosts?: StatBoosts
  multiplier?: number
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

type CharacterStats = {
  max_level: {
    HP: number
    ATK: number
    DEF: number
  }
  potential_55: {
    HP: number
    ATK: number
    DEF: number
  }
  potential_100: {
    HP: number
    ATK: number
    DEF: number
  }
}

export type Character = {
  id: string
  name: string
  imagePath: string
  rarity: number
  type: string
  cost: number
  stats?: CharacterStats
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
