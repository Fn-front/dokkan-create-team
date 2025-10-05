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
  max_level?: {
    HP: string
    ATK: string
    DEF: string
  }
  potential_55?: {
    HP: string
    ATK: string
    DEF: string
  }
  potential_100?: {
    HP: string
    ATK: string
    DEF: string
  }
}

export type CharacterForm = {
  form_id: string
  form_name: string
  display_name: string
  form_order: number
  is_base_form: boolean
  is_only_form: boolean
  stats: CharacterStats
  skills: CharacterSkills
  image_urls?: string[]
  image_url?: string
}

export type ReversibleForm = {
  skills: CharacterSkills
  image_url?: string
}

export type Character = {
  id: string
  rarity: string
  attribute: string
  cost: string
  forms?: CharacterForm[]
  reversible_forms?: ReversibleForm[]
  link_skills: string[]
  categories: string[]
  name?: string
  image_url?: string
  stats?: CharacterStats
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
