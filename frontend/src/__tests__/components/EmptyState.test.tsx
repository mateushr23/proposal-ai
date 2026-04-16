import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from '@/components/EmptyState'

describe('EmptyState', () => {
  it('renders title', () => {
    render(
      <EmptyState
        title="Nenhuma proposta ainda"
        description="Crie sua primeira proposta."
      />
    )
    expect(screen.getByText('Nenhuma proposta ainda')).toBeInTheDocument()
  })

  it('renders description', () => {
    render(
      <EmptyState
        title="Vazio"
        description="Nenhum dado encontrado para exibir."
      />
    )
    expect(screen.getByText('Nenhum dado encontrado para exibir.')).toBeInTheDocument()
  })

  it('renders action when provided', () => {
    render(
      <EmptyState
        title="Vazio"
        description="Sem dados."
        action={<button>Criar primeira proposta</button>}
      />
    )
    expect(screen.getByRole('button', { name: 'Criar primeira proposta' })).toBeInTheDocument()
  })

  it('does not render action area when action is not provided', () => {
    const { container } = render(
      <EmptyState title="Vazio" description="Sem dados." />
    )
    // Only the icon, title, and description should be present — no extra button wrapper
    const buttons = container.querySelectorAll('button')
    expect(buttons).toHaveLength(0)
  })

  it('renders the decorative icon', () => {
    const { container } = render(
      <EmptyState title="Empty" description="Nothing here." />
    )
    const svg = container.querySelector('svg')
    expect(svg).toBeTruthy()
    expect(svg?.getAttribute('width')).toBe('48')
    expect(svg?.getAttribute('height')).toBe('48')
  })

  it('applies muted color to description', () => {
    render(
      <EmptyState title="Title" description="Muted text" />
    )
    const desc = screen.getByText('Muted text')
    expect(desc.className).toContain('text-muted')
  })

  it('constrains description width to max-w-[40ch]', () => {
    render(
      <EmptyState title="Title" description="Constrained width text" />
    )
    const desc = screen.getByText('Constrained width text')
    expect(desc.className).toContain('max-w-[40ch]')
  })

  it('centers content vertically', () => {
    const { container } = render(
      <EmptyState title="Title" description="Desc" />
    )
    const wrapper = container.firstElementChild
    expect(wrapper?.className).toContain('flex')
    expect(wrapper?.className).toContain('flex-col')
    expect(wrapper?.className).toContain('items-center')
    expect(wrapper?.className).toContain('justify-center')
  })
})
