import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from '@/components/StatusBadge'
import type { ProposalStatus } from '@/types'

describe('StatusBadge', () => {
  const statuses: { status: ProposalStatus; label: string; colorHint: string }[] = [
    { status: 'draft', label: 'Rascunho', colorHint: 'muted' },
    { status: 'sent', label: 'Enviada', colorHint: 'accent' },
    { status: 'accepted', label: 'Aceita', colorHint: 'success' },
    { status: 'rejected', label: 'Recusada', colorHint: 'error' },
  ]

  for (const { status, label, colorHint } of statuses) {
    it(`renders "${label}" label for status "${status}"`, () => {
      render(<StatusBadge status={status} />)
      expect(screen.getByText(label)).toBeInTheDocument()
    })

    it(`applies ${colorHint} color classes for status "${status}"`, () => {
      render(<StatusBadge status={status} />)
      const badge = screen.getByText(label)
      expect(badge.className).toContain(colorHint)
    })
  }

  it('renders as an inline element with pill styling', () => {
    render(<StatusBadge status="draft" />)
    const badge = screen.getByText('Rascunho')
    expect(badge.className).toContain('inline-flex')
    expect(badge.className).toContain('rounded-[var(--radius-badge)]')
    expect(badge.className).toContain('uppercase')
    expect(badge.className).toContain('tracking-wide')
  })

  it('uses text-xs font size', () => {
    render(<StatusBadge status="sent" />)
    const badge = screen.getByText('Enviada')
    expect(badge.className).toContain('text-xs')
    expect(badge.className).toContain('font-medium')
  })
})
