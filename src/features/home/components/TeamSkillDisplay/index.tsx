import { memo } from 'react'
import styles from './style.module.scss'
import type { TeamSlot } from '@/functions/types/team'
import {
  getCharacterSkills,
  getCharacterStats,
} from '@/functions/utils/characterUtils'

type TeamSkillDisplayProps = {
  teamSlots: TeamSlot[]
}

const TeamSkillDisplay = memo<TeamSkillDisplayProps>(({ teamSlots }) => {
  // リーダースキルを取得する関数
  const getLeaderSkill = () => {
    const leaderSlot = teamSlots.find((slot) => slot.position === 0)

    if (!leaderSlot?.character) {
      return { text: 'リーダーを設置してください', conditions: null }
    }

    const skills = getCharacterSkills(leaderSlot.character)
    if (!skills) {
      return { text: 'リーダーを設置してください', conditions: null }
    }

    let selectedSkill = null

    if (skills.super_extreme?.leader_skill?.original_effect) {
      selectedSkill = skills.super_extreme.leader_skill
    } else if (skills.post_extreme?.leader_skill?.original_effect) {
      selectedSkill = skills.post_extreme.leader_skill
    } else if (skills.pre_extreme?.leader_skill?.original_effect) {
      selectedSkill = skills.pre_extreme.leader_skill
    }

    if (!selectedSkill) {
      return { text: 'スキル情報がありません', conditions: null }
    }

    return {
      text: selectedSkill.original_effect,
      conditions: selectedSkill.conditions || null,
    }
  }

  // フレンドスキルを取得する関数
  const getFriendSkill = () => {
    const friendSlot = teamSlots.find((slot) => slot.position === 6)

    if (!friendSlot?.character) {
      return { text: 'フレンドを設置してください', conditions: null }
    }

    const skills = getCharacterSkills(friendSlot.character)
    if (!skills) {
      return { text: 'フレンドを設置してください', conditions: null }
    }

    let selectedSkill = null

    if (skills.super_extreme?.leader_skill?.original_effect) {
      selectedSkill = skills.super_extreme.leader_skill
    } else if (skills.post_extreme?.leader_skill?.original_effect) {
      selectedSkill = skills.post_extreme.leader_skill
    } else if (skills.pre_extreme?.leader_skill?.original_effect) {
      selectedSkill = skills.pre_extreme.leader_skill
    }

    if (!selectedSkill) {
      return { text: 'スキル情報がありません', conditions: null }
    }

    return {
      text: selectedSkill.original_effect,
      conditions: selectedSkill.conditions || null,
    }
  }

  const leaderSkill = getLeaderSkill()
  const friendSkill = getFriendSkill()

  // HP合計計算
  const totalHP = teamSlots
    .filter((slot) => slot.character && getCharacterStats(slot.character))
    .reduce((sum, slot) => {
      const stats = getCharacterStats(slot.character!)
      const baseHP = stats?.potential_55?.HP
        ? parseInt(stats.potential_55.HP)
        : 0
      let totalMultiplier = 0

      if (leaderSkill.conditions) {
        for (const condition of leaderSkill.conditions) {
          if (condition.hp !== undefined) {
            totalMultiplier += condition.hp
            break
          }
        }
      }

      if (friendSkill.conditions) {
        for (const condition of friendSkill.conditions) {
          if (condition.hp !== undefined) {
            totalMultiplier += condition.hp
            break
          }
        }
      }

      let finalHP = baseHP
      if (totalMultiplier > 0) {
        const finalMultiplier = totalMultiplier - 1
        finalHP = Math.floor(baseHP * finalMultiplier)
      }

      return sum + finalHP
    }, 0)

  return (
    <>
      {/* リーダースキル */}
      <div className={styles.leaderSkill}>
        <span className={styles.skillLabel}>リーダースキル</span>
        <div className={styles.skillText}>{leaderSkill.text}</div>
      </div>

      {/* フレンドスキル */}
      <div className={styles.friendSkill}>
        <span className={styles.skillLabel}>フレンドスキル</span>
        <div className={styles.skillText}>{friendSkill.text}</div>
      </div>

      {/* HP合計 */}
      <div className={styles.hpSection}>
        <span className={styles.hpLabel}>HP</span>
        <div className={styles.hpValue}>
          {totalHP > 0 ? totalHP.toLocaleString() : '0'}
        </div>
      </div>
    </>
  )
})

TeamSkillDisplay.displayName = 'TeamSkillDisplay'

export default TeamSkillDisplay
