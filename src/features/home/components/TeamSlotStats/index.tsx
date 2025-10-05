import { memo } from 'react'
import type { Character, TeamSlot } from '@/functions/types/team'
import styles from '../TeamLayout/style.module.scss'
import {
  useNormalCharacterFinalStats,
  useLRActionStats,
  useSuperAttackCount,
} from '../../hooks/useCharacterStats'

type TeamSlotStatsProps = {
  character: Character
  teamSlots: TeamSlot[]
}

const TeamSlotStats = memo<TeamSlotStatsProps>(({ character, teamSlots }) => {
  // 55%ステータス（conditions除外、multiplier適用）
  const stats55 = useNormalCharacterFinalStats({
    character,
    teamSlots,
    potential: 'potential_55',
  })

  // 100%ステータス（conditions除外、multiplier適用）
  const stats100 = useNormalCharacterFinalStats({
    character,
    teamSlots,
    potential: 'potential_100',
  })

  // 行動後ステータス（LRのみ、conditions含む）
  const actionStats = useLRActionStats({ character, teamSlots })

  // super_attack_count取得
  const superAttackCount = useSuperAttackCount(character.skills)

  return (
    <div className={styles.characterStats}>
      {/* 55% */}
      <div className={styles.statRow}>
        <span className={styles.statLabel}>55%</span>
        <span className={styles.statValues}>
          {stats55.atk.toLocaleString()} / {stats55.def.toLocaleString()}
        </span>
      </div>

      {/* 100% */}
      <div className={styles.statRow}>
        <span className={styles.statLabel}>100%</span>
        <span className={styles.statValues}>
          {stats100.atk.toLocaleString()} / {stats100.def.toLocaleString()}
        </span>
      </div>

      {/* 行動後（LRのみ表示） */}
      <div className={styles.statRow}>
        <span className={styles.statLabel}>
          行動後（必殺{superAttackCount + 1}回）
        </span>
        <span className={styles.statValues}>
          {actionStats.atk.toLocaleString()} /{' '}
          {actionStats.def.toLocaleString()}
        </span>
      </div>
    </div>
  )
})

TeamSlotStats.displayName = 'TeamSlotStats'

export default TeamSlotStats
