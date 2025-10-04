type SkillCondition = {
  type: string
  target: string
  ki?: number
  hp?: number
  atk?: number
  def?: number
}

type StatBoost = {
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
  conditions?: {
    enemy?: {
      super?: {
        ki?: number
        atk?: number
        def?: number
      }
      categories?: {
        targets?: string[]
        ki?: number
      }
    }
    ally?: {
      extreme?: {
        atk?: number
        def?: number
      }
      categories?: {
        targets?: string[]
        def?: number
      }
    }
  }
  defensive?: {
    when_attacked?: {
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
  stat_boost?: StatBoost
  multiplier?: number
  super_attack_count?: number
}

type SkillSet = {
  leader_skill: Skill | null
  super_attack: Skill | null
  ultra_super_attack?: Skill | null
  passive_skill: Skill | null
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
  name: string
  rarity?: string
  attribute?: string
  cost?: string
  image_url?: string
  stats?: CharacterStats
  skills?: CharacterSkills
  link_skills?: string[]
  categories?: string[]
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
