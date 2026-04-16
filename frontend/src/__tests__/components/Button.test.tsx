import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/Button'

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('applies primary variant classes by default', () => {
    render(<Button>Primary</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-[var(--color-accent)]')
    expect(btn.className).toContain('text-white')
  })

  it('applies secondary variant classes', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-[var(--color-surface)]')
  })

  it('applies ghost variant classes', () => {
    render(<Button variant="ghost">Ghost</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-transparent')
  })

  it('applies error variant classes', () => {
    render(<Button variant="error">Delete</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-[var(--color-error)]')
  })

  it('applies size sm classes', () => {
    render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button').className).toContain('h-8')
  })

  it('applies size lg classes', () => {
    render(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button').className).toContain('h-12')
  })

  it('handles click events', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)

    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading spinner and disables button when loading', () => {
    render(<Button loading>Submit</Button>)
    const btn = screen.getByRole('button')

    expect(btn).toBeDisabled()
    // The children text should NOT be visible — spinner replaces it
    expect(screen.queryByText('Submit')).not.toBeInTheDocument()
    // Spinner element should be rendered (the animate-spin div)
    expect(btn.querySelector('.animate-spin')).toBeTruthy()
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('does not fire click when disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button disabled onClick={onClick}>No click</Button>)

    await user.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders icon on the left when icon prop is provided', () => {
    const icon = <span data-testid="left-icon">*</span>
    render(<Button icon={icon}>With Icon</Button>)
    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
  })

  it('renders icon on the right when iconRight prop is provided', () => {
    const icon = <span data-testid="right-icon">-&gt;</span>
    render(<Button iconRight={icon}>With Right Icon</Button>)
    expect(screen.getByTestId('right-icon')).toBeInTheDocument()
  })

  it('merges custom className', () => {
    render(<Button className="custom-class">Merge</Button>)
    expect(screen.getByRole('button').className).toContain('custom-class')
  })
})
