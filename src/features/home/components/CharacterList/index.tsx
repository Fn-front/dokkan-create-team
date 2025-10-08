import { memo, useState } from 'react'
import styles from './style.module.scss'
import { sampleCharacters } from '@/functions/data/characters'
import type { Character } from '@/functions/types/team'
import CharacterCard from '@/features/home/components/CharacterCard'
import CharacterDetailDialog from '@/components/CharacterDetailDialog/CharacterDetailDialog'
import { useDialog } from '@/functions/hooks/useDialog'
import {
  isReversibleCharacter,
  hasMultipleForms,
} from '@/functions/utils/characterUtils'
import { useCharacterDragDrop } from './hooks/useCharacterDragDrop'

type CharacterListProps = {
  onCharacterDragStart: (character: Character) => void
  canPlaceCharacter: (character: Character, position: number) => boolean
  toggleReversibleForm: (characterId: string) => void
  getReversibleFormIndex: (characterId: string) => number
  toggleForm: (characterId: string, maxFormIndex: number) => void
  getFormIndex: (characterId: string) => number
}

const CharacterList = memo<CharacterListProps>(
  ({
    onCharacterDragStart,
    canPlaceCharacter,
    toggleReversibleForm,
    getReversibleFormIndex,
    toggleForm,
    getFormIndex,
  }) => {
    const [selectedCharacter, setSelectedCharacter] =
      useState<Character | null>(null)
    const { open: dialogOpen, setOpen: setDialogOpen } = useDialog()

    const { handleMouseDown } = useCharacterDragDrop({
      onCharacterDragStart,
      canPlaceCharacter,
    })

    // キャラクターがどこかに配置可能かチェックする関数
    const canPlaceAnywhere = (character: Character): boolean => {
      for (let position = 0; position <= 6; position++) {
        if (canPlaceCharacter(character, position)) {
          return true
        }
      }
      return false
    }

    // 詳細ボタンクリック時の処理
    const handleDetailClick = (
      e: React.MouseEvent,
      character: Character
    ): void => {
      e.stopPropagation()
      setSelectedCharacter(character)
      setDialogOpen(true)
    }

    // 回転アイコンクリック時の処理（reversible用）
    const handleSwitchClick = (
      e: React.MouseEvent,
      character: Character
    ): void => {
      e.stopPropagation()
      toggleReversibleForm(character.id)
    }

    // 変身アイコンクリック時の処理（forms用）
    const handleTransformClick = (
      e: React.MouseEvent,
      character: Character
    ): void => {
      e.stopPropagation()
      if (character.forms) {
        toggleForm(character.id, character.forms.length - 1)
      }
    }

    return (
      <div className={styles.container}>
        <h2 className={styles.title}>キャラクター一覧</h2>
        <div className={styles.grid}>
          {sampleCharacters.map((character) => {
            const isPlaceable = canPlaceAnywhere(character)
            const isReversible = isReversibleCharacter(character)
            const hasMultiple = hasMultipleForms(character)

            let formIndex = 0
            if (isReversible) {
              formIndex = getReversibleFormIndex(character.id)
            } else if (hasMultiple) {
              formIndex = getFormIndex(character.id)
            }

            return (
              <CharacterCard
                key={character.id}
                character={character}
                isPlaceable={isPlaceable}
                formIndex={formIndex}
                onMouseDown={isPlaceable ? handleMouseDown : undefined}
                onDetailClick={handleDetailClick}
                onSwitchClick={isReversible ? handleSwitchClick : undefined}
                onTransformClick={
                  hasMultiple ? handleTransformClick : undefined
                }
              />
            )
          })}
        </div>
        {selectedCharacter && (
          <CharacterDetailDialog
            character={selectedCharacter}
            formIndex={
              isReversibleCharacter(selectedCharacter)
                ? getReversibleFormIndex(selectedCharacter.id)
                : hasMultipleForms(selectedCharacter)
                  ? getFormIndex(selectedCharacter.id)
                  : 0
            }
            open={dialogOpen}
            onOpenChange={setDialogOpen}
          />
        )}
      </div>
    )
  }
)

CharacterList.displayName = 'CharacterList'

export default CharacterList
