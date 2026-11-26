import { useId, useState, type FormEvent } from 'react'
import { Button } from '../../atoms/Button'
import { Input } from '../../atoms/Input'
import { Label } from '../../atoms/Label'

export interface SearchBarProps {
  initialValue?: string
  placeholder?: string
  label?: string
  isLoading?: boolean
  onSearch: (term: string) => void
}

export function SearchBar({
  initialValue = '',
  placeholder = 'Buscar relatos, ilhas ou Poneglyphs...',
  label = 'Pesquisar registros',
  isLoading = false,
  onSearch,
}: SearchBarProps) {
  const [term, setTerm] = useState(initialValue)
  const inputId = useId()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSearch(term.trim())
  }

  function handleClear() {
    setTerm('')
    onSearch('')
  }

  return (
    <form
      role="search"
      aria-label={label}
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 sm:flex-row sm:items-center"
    >
      <div className="relative flex-1">
        <Label htmlFor={inputId} className="sr-only">
          {label}
        </Label>
        <Input
          id={inputId}
          type="search"
          value={term}
          placeholder={placeholder}
          onChange={(event) => setTerm(event.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        {term.trim().length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={handleClear}
          >
            Limpar
          </Button>
        )}
        <Button
          type="submit"
          variant="secondary"
          size="md"
          isLoading={isLoading}
        >
          Buscar
        </Button>
      </div>
    </form>
  )
}
