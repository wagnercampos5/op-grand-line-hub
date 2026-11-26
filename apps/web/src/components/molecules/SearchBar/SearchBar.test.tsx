import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, expect, it, vi } from 'vitest'
import { SearchBar } from './SearchBar'

describe('SearchBar', () => {
  it('submits search term, clears input, and passes axe accessibility checks', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()

    const { container } = render(
      <SearchBar
        label="Buscar crônicas"
        placeholder="Pesquisar na Grand Line..."
        onSearch={onSearch}
      />,
    )

    expect(await axe(container)).toHaveNoViolations()

    const input = screen.getByRole('searchbox', { name: 'Buscar crônicas' })
    await user.type(input, '  Skypiea  ')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))

    expect(onSearch).toHaveBeenCalledWith('Skypiea')

    await user.click(screen.getByRole('button', { name: 'Limpar' }))
    expect(onSearch).toHaveBeenLastCalledWith('')
    expect(input).toHaveValue('')
  })
})
