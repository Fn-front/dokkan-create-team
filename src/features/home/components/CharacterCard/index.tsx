import { memo } from 'react'
import Image from 'next/image'
import styles from './style.module.scss'
import type { Character } from '@/functions/types/team'
import { cn } from '@/lib/utils'
import { DetailIcon, SwitchIcon, TransformIcon } from '@/components/icons'
import {
  getDisplayName,
  getImageUrl,
  getCharacterSkills,
  isReversibleCharacter,
  hasMultipleForms,
} from '@/functions/utils/characterUtils'

type CharacterCardProps = {
  character: Character
  isPlaceable: boolean
  formIndex: number
  onMouseDown?: (e: React.MouseEvent, character: Character) => void
  onDetailClick: (e: React.MouseEvent, character: Character) => void
  onSwitchClick?: (e: React.MouseEvent, character: Character) => void
  onTransformClick?: (e: React.MouseEvent, character: Character) => void
}

const CharacterCard = memo<CharacterCardProps>(
  ({
    character,
    isPlaceable,
    formIndex,
    onMouseDown,
    onDetailClick,
    onSwitchClick,
    onTransformClick,
  }) => {
    const displayName = getDisplayName(character)
    const isReversible = isReversibleCharacter(character)
    const hasMultiple = hasMultipleForms(character)
    const imageUrl = getImageUrl(character, formIndex)
    const skills = getCharacterSkills(character, formIndex)

    return (
      <div
        className={cn(styles.characterCard, !isPlaceable && styles.disabled)}
        onMouseDown={
          isPlaceable && onMouseDown
            ? (e) => onMouseDown(e, character)
            : undefined
        }
        data-testid="character-card"
        role="button"
        tabIndex={isPlaceable ? 0 : -1}
      >
        {skills && (
          <button
            className={styles.detailButton}
            onClick={(e) => onDetailClick(e, character)}
            onMouseDown={(e) => e.stopPropagation()}
            aria-label="詳細を表示"
          >
            <DetailIcon className={styles.detailIcon} />
          </button>
        )}
        {isReversible && onSwitchClick && (
          <button
            className={styles.switchButton}
            onClick={(e) => onSwitchClick(e, character)}
            onMouseDown={(e) => e.stopPropagation()}
            aria-label="フォーム切り替え"
          >
            <SwitchIcon className={styles.switchIcon} />
          </button>
        )}
        {hasMultiple && onTransformClick && (
          <button
            className={styles.transformButton}
            onClick={(e) => onTransformClick(e, character)}
            onMouseDown={(e) => e.stopPropagation()}
            aria-label="変身"
          >
            <TransformIcon className={styles.transformIcon} />
          </button>
        )}
        {imageUrl ? (
          <Image
            className={styles.characterImage}
            src={imageUrl}
            alt={displayName}
            width={100}
            height={100}
            key={formIndex}
          />
        ) : (
          <div className={styles.characterText}>{displayName}</div>
        )}
      </div>
    )
  }
)

CharacterCard.displayName = 'CharacterCard'

export default CharacterCard
