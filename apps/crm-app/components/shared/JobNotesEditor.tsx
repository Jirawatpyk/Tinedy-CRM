'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { Save, Loader2, FileText, RotateCcw } from 'lucide-react'

interface JobNotesEditorProps {
  jobId: string
  initialNotes: string
  onNotesChange?: (newNotes: string) => void
}

const MAX_CHARACTERS = 2000
const AUTO_SAVE_DELAY = 3000 // 3 seconds

export function JobNotesEditor({
  jobId,
  initialNotes,
  onNotesChange,
}: JobNotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes || '')
  const [originalNotes, setOriginalNotes] = useState(initialNotes || '')
  const [isLoading, setIsLoading] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const remainingCharacters = MAX_CHARACTERS - notes.length
  const isOverLimit = remainingCharacters < 0

  const handleSaveNotes = useCallback(
    async (isAutoSave = false) => {
      if (isOverLimit) {
        toast.error('ข้อผิดพลาด', {
          description: 'หมายเหตุเกินจำนวนตัวอักษรที่อนุญาต',
        })
        return
      }

      setIsLoading(true)

      try {
        const response = await fetch(`/api/jobs/${jobId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            notes: notes.trim() || null,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            errorData.error || 'เกิดข้อผิดพลาดในการบันทึกหมายเหตุ'
          )
        }

        const updatedJob = await response.json()

        setOriginalNotes(notes)
        setHasUnsavedChanges(false)
        setLastSaved(new Date())

        if (!isAutoSave) {
          toast.success('บันทึกหมายเหตุสำเร็จ', {
            description: 'หมายเหตุของงานได้รับการอัปเดตแล้ว',
          })
        }

        // Call the callback if provided
        if (onNotesChange) {
          onNotesChange(notes)
        }
      } catch (error) {
        console.error('Error saving job notes:', error)
        toast.error('เกิดข้อผิดพลาด', {
          description:
            error instanceof Error
              ? error.message
              : 'ไม่สามารถบันทึกหมายเหตุได้',
        })
      } finally {
        setIsLoading(false)
      }
    },
    [jobId, notes, isOverLimit, onNotesChange]
  )

  useEffect(() => {
    const hasChanges = notes !== originalNotes
    setHasUnsavedChanges(hasChanges)

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    // Set up auto-save if there are changes
    if (hasChanges && !isOverLimit) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleSaveNotes(true) // Auto-save
      }, AUTO_SAVE_DELAY)
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [notes, originalNotes, isOverLimit, handleSaveNotes])

  const handleNotesChange = (value: string) => {
    setNotes(value)
  }

  const handleDiscardChanges = () => {
    setNotes(originalNotes)
    setHasUnsavedChanges(false)
    setShowDiscardDialog(false)

    // Clear auto-save timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    toast.info('ยกเลิกการเปลี่ยนแปลง', {
      description: 'กลับไปใช้หมายเหตุเดิม',
    })
  }

  const getCharacterLimitColor = () => {
    if (isOverLimit) return 'text-destructive'
    if (remainingCharacters < 100) return 'text-orange-500'
    return 'text-muted-foreground'
  }

  return (
    <>
      <div className="space-y-4">
        {/* Notes Editor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-muted-foreground">
              <FileText className="w-4 h-4 inline mr-1" />
              หมายเหตุเพิ่มเติม
            </label>

            {lastSaved && (
              <div className="text-xs text-muted-foreground">
                บันทึกล่าสุด: {lastSaved.toLocaleTimeString('th-TH')}
              </div>
            )}
          </div>

          <Textarea
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="เพิ่มหมายเหตุสำหรับงานนี้..."
            className={`min-h-[120px] resize-none ${
              isOverLimit ? 'border-destructive' : ''
            }`}
            disabled={isLoading}
          />

          {/* Character Counter */}
          <div className="flex items-center justify-between text-xs">
            <div className={getCharacterLimitColor()}>
              {isOverLimit
                ? `เกินจำนวนตัวอักษร ${Math.abs(remainingCharacters)} ตัว`
                : `เหลือ ${remainingCharacters} ตัวอักษร`}
            </div>

            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-xs">
                มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก
              </Badge>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleSaveNotes(false)}
            disabled={isLoading || !hasUnsavedChanges || isOverLimit}
            size="sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                บันทึกหมายเหตุ
              </>
            )}
          </Button>

          {hasUnsavedChanges && (
            <Button
              variant="outline"
              onClick={() => setShowDiscardDialog(true)}
              disabled={isLoading}
              size="sm"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              ยกเลิกการเปลี่ยนแปลง
            </Button>
          )}
        </div>

        {/* Auto-save Notice */}
        <div className="text-xs text-muted-foreground">
          💡 หมายเหตุจะถูกบันทึกอัตโนมัติหลังจากหยุดพิมพ์ 3 วินาที
        </div>
      </div>

      {/* Discard Changes Dialog */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการยกเลิกการเปลี่ยนแปลง</AlertDialogTitle>
            <AlertDialogDescription>
              คุณมีการเปลี่ยนแปลงหมายเหตุที่ยังไม่ได้บันทึก
              คุณต้องการยกเลิกการเปลี่ยนแปลงและกลับไปใช้หมายเหตุเดิมใช่หรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDiscardDialog(false)}>
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscardChanges}>
              ยกเลิกการเปลี่ยนแปลง
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
