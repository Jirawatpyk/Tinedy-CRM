// ChecklistItemsEditor Component
// Story 2.5: Dynamic checklist items editor for template management
'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Plus } from 'lucide-react'
import { Label } from '@/components/ui/label'

interface ChecklistItemsEditorProps {
  items: string[]
  onChange: (items: string[]) => void
  disabled?: boolean
}

export function ChecklistItemsEditor({
  items,
  onChange,
  disabled = false,
}: ChecklistItemsEditorProps) {
  const [newItem, setNewItem] = useState('')

  const handleAddItem = () => {
    if (newItem.trim()) {
      onChange([...items, newItem.trim()])
      setNewItem('')
    }
  }

  const handleRemoveItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index)
    onChange(updatedItems)
  }

  const handleUpdateItem = (index: number, value: string) => {
    const updatedItems = [...items]
    updatedItems[index] = value
    onChange(updatedItems)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddItem()
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Checklist Items</Label>
        <p className="text-sm text-muted-foreground">
          Add items that need to be checked during service quality control
        </p>
      </div>

      {/* Existing Items */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground w-8">
              {index + 1}.
            </span>
            <Input
              value={item}
              onChange={(e) => handleUpdateItem(index, e.target.value)}
              disabled={disabled}
              placeholder="Checklist item"
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveItem(index)}
              disabled={disabled || items.length === 1}
              title="Remove item"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add New Item */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground w-8">
          {items.length + 1}.
        </span>
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          placeholder="Add new checklist item"
          className="flex-1"
        />
        <Button
          type="button"
          onClick={handleAddItem}
          disabled={disabled || !newItem.trim()}
          size="icon"
          title="Add item"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {items.length === 0 && (
        <p className="text-sm text-destructive">
          At least one checklist item is required
        </p>
      )}
    </div>
  )
}
