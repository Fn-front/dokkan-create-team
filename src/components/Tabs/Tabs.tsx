'use client'

import { memo, type ReactNode } from 'react'
import * as RadixTabs from '@radix-ui/react-tabs'
import styles from './styles.module.scss'

interface Tab {
  value: string
  label: string
  content: ReactNode
}

interface TabsProps {
  tabs: Tab[]
  defaultValue?: string
  className?: string
}

const Tabs = memo<TabsProps>(({ tabs, defaultValue, className }) => {
  const firstTab = tabs[0]?.value || ''

  return (
    <RadixTabs.Root
      defaultValue={defaultValue || firstTab}
      className={className}
    >
      <RadixTabs.List className={styles.tabsList}>
        {tabs.map((tab) => (
          <RadixTabs.Trigger
            key={tab.value}
            value={tab.value}
            className={styles.tabsTrigger}
          >
            {tab.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>

      {tabs.map((tab) => (
        <RadixTabs.Content
          key={tab.value}
          value={tab.value}
          className={styles.tabsContent}
        >
          {tab.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  )
})

Tabs.displayName = 'Tabs'

export default Tabs
