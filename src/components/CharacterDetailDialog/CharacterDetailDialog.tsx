'use client'

import { memo, useMemo } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { type Character } from '@/functions/types/team'
import Tabs from '@/components/Tabs/Tabs'
import styles from './styles.module.scss'

interface CharacterDetailDialogProps {
  character: Character
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ExtremeLevelKey = 'pre_extreme' | 'post_extreme' | 'super_extreme'

const EXTREME_LABELS: Record<ExtremeLevelKey, string> = {
  pre_extreme: '通常',
  post_extreme: '極限',
  super_extreme: '超極限',
}

const CharacterDetailDialog = memo<CharacterDetailDialogProps>(
  ({ character, open, onOpenChange }) => {
    const { skills } = character

    // 存在するタブを取得（少なくとも1つのスキルがnullでない場合のみ）
    const availableTabs: ExtremeLevelKey[] = useMemo(() => {
      const tabs: ExtremeLevelKey[] = []

      const hasAnySkill = (key: ExtremeLevelKey) => {
        const skillSet = skills?.[key]
        if (!skillSet) return false

        return !!(
          skillSet.leader_skill ||
          skillSet.super_attack ||
          skillSet.ultra_super_attack ||
          skillSet.passive_skill ||
          skillSet.active_skill
        )
      }

      if (hasAnySkill('pre_extreme')) tabs.push('pre_extreme')
      if (hasAnySkill('post_extreme')) tabs.push('post_extreme')
      if (hasAnySkill('super_extreme')) tabs.push('super_extreme')
      return tabs
    }, [skills])

    // タブのデータを作成
    const tabsData = useMemo(
      () =>
        availableTabs.map((key) => {
          const skillSet = skills![key]!
          return {
            value: key,
            label: EXTREME_LABELS[key],
            content: (
              <>
                {/* リーダースキル */}
                {skillSet.leader_skill?.original_effect && (
                  <div className={styles.skillSection}>
                    <h3 className={styles.skillTitle}>リーダースキル</h3>
                    <p className={styles.skillEffect}>
                      {skillSet.leader_skill.original_effect}
                    </p>
                  </div>
                )}

                {/* 必殺技 */}
                {skillSet.super_attack?.original_effect && (
                  <div className={styles.skillSection}>
                    <h3 className={styles.skillTitle}>必殺技</h3>
                    <p className={styles.skillEffect}>
                      {skillSet.super_attack.original_effect}
                    </p>
                  </div>
                )}

                {/* 超必殺技 */}
                {skillSet.ultra_super_attack?.original_effect && (
                  <div className={styles.skillSection}>
                    <h3 className={styles.skillTitle}>超必殺技</h3>
                    <p className={styles.skillEffect}>
                      {skillSet.ultra_super_attack.original_effect}
                    </p>
                  </div>
                )}

                {/* パッシブスキル */}
                {skillSet.passive_skill?.original_effect && (
                  <div className={styles.skillSection}>
                    <h3 className={styles.skillTitle}>パッシブスキル</h3>
                    <p className={styles.skillEffect}>
                      {skillSet.passive_skill.original_effect}
                    </p>
                  </div>
                )}

                {/* アクティブスキル */}
                {skillSet.active_skill?.original_effect && (
                  <div className={styles.skillSection}>
                    <h3 className={styles.skillTitle}>アクティブスキル</h3>
                    <p className={styles.skillEffect}>
                      {skillSet.active_skill.original_effect}
                    </p>
                  </div>
                )}
              </>
            ),
          }
        }),
      [availableTabs, skills]
    )

    if (availableTabs.length === 0) {
      return null
    }

    return (
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.overlay} />
          <Dialog.Content className={styles.content}>
            <Dialog.Title className={styles.title}>
              {character.name}
            </Dialog.Title>

            <Tabs
              tabs={tabsData}
              defaultValue={availableTabs[availableTabs.length - 1]}
              className={styles.tabs}
            />

            {/* リンクスキル */}
            {character.link_skills && character.link_skills.length > 0 && (
              <div className={styles.skillSection}>
                <h3 className={styles.skillTitle}>リンクスキル</h3>
                <ul className={styles.linkList}>
                  {character.link_skills.map((link, index) => (
                    <li key={index} className={styles.linkItem}>
                      {link}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* カテゴリ */}
            {character.categories && character.categories.length > 0 && (
              <div className={styles.skillSection}>
                <h3 className={styles.skillTitle}>カテゴリ</h3>
                <ul className={styles.categoryList}>
                  {character.categories.map((category, index) => (
                    <li key={index} className={styles.categoryItem}>
                      {category}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Dialog.Close className={styles.closeButton}>×</Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    )
  }
)

CharacterDetailDialog.displayName = 'CharacterDetailDialog'

export default CharacterDetailDialog
