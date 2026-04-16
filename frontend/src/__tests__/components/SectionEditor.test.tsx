import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SectionEditor } from '@/components/SectionEditor'

describe('SectionEditor', () => {
  const defaultProps = {
    title: 'introduction',
    content: 'This is the introduction text.',
    onSave: vi.fn(),
  }

  it('renders the section title with translated label', () => {
    render(<SectionEditor {...defaultProps} />)
    expect(screen.getByText('Introdução')).toBeInTheDocument()
  })

  it('renders translated label for scope section', () => {
    render(<SectionEditor {...defaultProps} title="scope" />)
    expect(screen.getByText('Escopo do projeto')).toBeInTheDocument()
  })

  it('renders translated label for investment section', () => {
    render(<SectionEditor {...defaultProps} title="investment" />)
    expect(screen.getByText('Investimento')).toBeInTheDocument()
  })

  it('renders translated label for next_steps section', () => {
    render(<SectionEditor {...defaultProps} title="next_steps" />)
    expect(screen.getByText('Próximos passos')).toBeInTheDocument()
  })

  it('falls back to raw title when no label mapping exists', () => {
    render(<SectionEditor {...defaultProps} title="custom_section" />)
    expect(screen.getByText('custom_section')).toBeInTheDocument()
  })

  it('shows content in read mode by default', () => {
    render(<SectionEditor {...defaultProps} />)
    expect(screen.getByText('This is the introduction text.')).toBeInTheDocument()
    // No textarea visible
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('shows Editar button in read mode', () => {
    render(<SectionEditor {...defaultProps} />)
    expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument()
  })

  it('toggles to edit mode when Editar is clicked', async () => {
    const user = userEvent.setup()
    render(<SectionEditor {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /editar/i }))

    // Textarea should appear with content
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveValue('This is the introduction text.')

    // Save and Cancel buttons should appear
    expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()

    // Editar button should be hidden
    expect(screen.queryByRole('button', { name: /editar/i })).not.toBeInTheDocument()
  })

  it('saves edited text when Salvar is clicked', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<SectionEditor {...defaultProps} onSave={onSave} />)

    await user.click(screen.getByRole('button', { name: /editar/i }))

    const textarea = screen.getByRole('textbox')
    await user.clear(textarea)
    await user.type(textarea, 'Updated introduction text.')

    await user.click(screen.getByRole('button', { name: /salvar/i }))

    expect(onSave).toHaveBeenCalledWith('Updated introduction text.')
    // Should return to read mode
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('reverts text when Cancelar is clicked', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<SectionEditor {...defaultProps} onSave={onSave} />)

    await user.click(screen.getByRole('button', { name: /editar/i }))

    const textarea = screen.getByRole('textbox')
    await user.clear(textarea)
    await user.type(textarea, 'Should be reverted')

    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(onSave).not.toHaveBeenCalled()
    // Original content should still be displayed
    expect(screen.getByText('This is the introduction text.')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('applies accent left border in read mode', () => {
    const { container } = render(<SectionEditor {...defaultProps} />)
    const card = container.querySelector('.glass-card')
    expect(card?.className).toContain('border-l-[3px]')
    expect(card?.className).toContain('border-l-accent')
  })
})
