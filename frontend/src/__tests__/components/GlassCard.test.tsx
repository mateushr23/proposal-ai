import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GlassCard } from '@/components/GlassCard'

describe('GlassCard', () => {
  it('renders children content', () => {
    render(<GlassCard>Card content</GlassCard>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('applies glass-card CSS class', () => {
    render(<GlassCard>Content</GlassCard>)
    const card = screen.getByText('Content').closest('.glass-card')
    expect(card).toBeTruthy()
  })

  it('applies default padding p-6', () => {
    render(<GlassCard>Padded</GlassCard>)
    const card = screen.getByText('Padded').closest('.glass-card')
    expect(card?.className).toContain('p-6')
  })

  it('accepts custom padding', () => {
    render(<GlassCard padding="p-4">Custom</GlassCard>)
    const card = screen.getByText('Custom').closest('.glass-card')
    expect(card?.className).toContain('p-4')
  })

  it('applies hover classes when hoverable', () => {
    render(<GlassCard hoverable>Hover me</GlassCard>)
    const card = screen.getByText('Hover me').closest('.glass-card')
    expect(card?.className).toContain('hover:scale-[1.01]')
    expect(card?.className).toContain('cursor-pointer')
  })

  it('does not apply hover classes by default', () => {
    render(<GlassCard>No hover</GlassCard>)
    const card = screen.getByText('No hover').closest('.glass-card')
    expect(card?.className).not.toContain('cursor-pointer')
  })

  it('handles click events when onClick is provided', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<GlassCard onClick={onClick}>Clickable</GlassCard>)

    await user.click(screen.getByText('Clickable'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('sets role="button" and tabIndex when onClick is provided', () => {
    const onClick = vi.fn()
    render(<GlassCard onClick={onClick}>Interactive</GlassCard>)
    const card = screen.getByRole('button')
    expect(card).toBeInTheDocument()
    expect(card).toHaveAttribute('tabindex', '0')
  })

  it('does not set role="button" when no onClick', () => {
    render(<GlassCard>Static</GlassCard>)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('handles Enter key press when interactive', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<GlassCard onClick={onClick}>Keyboard</GlassCard>)

    const card = screen.getByRole('button')
    card.focus()
    await user.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('handles Space key press when interactive', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<GlassCard onClick={onClick}>Spacebar</GlassCard>)

    const card = screen.getByRole('button')
    card.focus()
    await user.keyboard(' ')
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('merges custom className', () => {
    render(<GlassCard className="my-custom-class">Merge</GlassCard>)
    const card = screen.getByText('Merge').closest('.glass-card')
    expect(card?.className).toContain('my-custom-class')
  })
})
