import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormField } from '@/components/FormField'

describe('FormField', () => {
  it('renders label text linked to input', () => {
    render(<FormField label="E-mail" />)
    const input = screen.getByLabelText('E-mail')
    expect(input).toBeInTheDocument()
    expect(input.tagName).toBe('INPUT')
  })

  it('renders a textarea when as="textarea"', () => {
    render(<FormField label="Descricao" as="textarea" />)
    const textarea = screen.getByLabelText('Descricao')
    expect(textarea.tagName).toBe('TEXTAREA')
  })

  it('shows error message with role="alert"', () => {
    render(<FormField label="Senha" error="Informe sua senha" />)
    const error = screen.getByRole('alert')
    expect(error).toHaveTextContent('Informe sua senha')
  })

  it('applies error styling to input when error prop is set', () => {
    render(<FormField label="Campo" error="Required" />)
    const input = screen.getByLabelText('Campo')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('shows helper text when no error', () => {
    render(<FormField label="Nome" helper="Informe seu nome completo" />)
    expect(screen.getByText('Informe seu nome completo')).toBeInTheDocument()
  })

  it('hides helper text when error is present', () => {
    render(<FormField label="Nome" helper="Informe seu nome" error="Campo obrigatorio" />)
    expect(screen.queryByText('Informe seu nome')).not.toBeInTheDocument()
    expect(screen.getByText('Campo obrigatorio')).toBeInTheDocument()
  })

  it('handles user input', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<FormField label="E-mail" onChange={onChange} />)

    await user.type(screen.getByLabelText('E-mail'), 'test@example.com')
    expect(onChange).toHaveBeenCalled()
  })

  it('passes placeholder to input', () => {
    render(<FormField label="E-mail" placeholder="seu@email.com" />)
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument()
  })

  it('sets aria-describedby linking to error element', () => {
    render(<FormField label="Field" error="Error msg" />)
    const input = screen.getByLabelText('Field')
    const describedBy = input.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()

    const errorEl = screen.getByRole('alert')
    expect(errorEl.id).toBe(describedBy)
  })
})
