import { memo } from 'react'
import styles from './style.module.scss'
import type { Character, TeamSlot } from '@/functions/types/team'
import TeamSlotComponent from '@/features/home/components/TeamSlot'
import TeamSkillDisplay from '@/features/home/components/TeamSkillDisplay'
import { useTeamDragDrop } from './hooks/useTeamDragDrop'

type TeamLayoutProps = {
  teamSlots: TeamSlot[]
  onCharacterDrop: (character: Character, position: number) => void
  onSlotClick: (position: number) => void
  onCharacterRemove: (position: number) => void
  onCharacterMove: (fromPosition: number, toPosition: number) => void
  canMoveCharacter?: (fromPosition: number, toPosition: number) => boolean
  toggleReversibleForm: (characterId: string) => void
  getReversibleFormIndex: (characterId: string) => number
  toggleForm: (characterId: string, maxFormIndex: number) => void
  getFormIndex: (characterId: string) => number
}

const TeamLayout = memo<TeamLayoutProps>(
  ({
    teamSlots,
    onCharacterDrop,
    onSlotClick,
    onCharacterRemove,
    onCharacterMove,
    canMoveCharacter,
    toggleReversibleForm,
    getReversibleFormIndex,
    toggleForm,
    getFormIndex,
  }) => {
    const { draggedFromPosition, isDragging, handleSlotMouseDown } =
      useTeamDragDrop({
        onCharacterMove,
        onCharacterRemove,
        canMoveCharacter,
      })

    return (
      <div className={styles.container} data-testid="team-layout">
        <TeamSkillDisplay teamSlots={teamSlots} />

        <div className={styles.teamSlots}>
          {teamSlots.map((slot, index) => (
            <TeamSlotComponent
              key={slot.position}
              slot={slot}
              index={index}
              draggedFromPosition={draggedFromPosition}
              isDragging={isDragging}
              teamSlots={teamSlots}
              onCharacterDrop={onCharacterDrop}
              onSlotClick={onSlotClick}
              onMouseDown={handleSlotMouseDown}
              toggleReversibleForm={toggleReversibleForm}
              getReversibleFormIndex={getReversibleFormIndex}
              toggleForm={toggleForm}
              getFormIndex={getFormIndex}
            />
          ))}
        </div>
      </div>
    )
  }
)

TeamLayout.displayName = 'TeamLayout'

export default TeamLayout
