import { useId } from 'react'
import { Input } from '../../atoms/Input'
import type { InputProps } from '../../atoms/Input'
import { Label } from '../../atoms/Label'
import { Select } from '../../atoms/Select'
import type { SelectOption, SelectProps } from '../../atoms/Select'

interface BaseFormFieldProps {
  id?: string
  label: string
  error?: string
  helperText?: string
  requiredIndicator?: boolean
}

type InputFormFieldProps = BaseFormFieldProps &
  Omit<InputProps, 'id' | 'hasError'> & {
    options?: undefined
  }

type SelectFormFieldProps = BaseFormFieldProps &
  Omit<SelectProps, 'id' | 'hasError' | 'options'> & {
    options: readonly SelectOption[]
  }

export type FormFieldProps = InputFormFieldProps | SelectFormFieldProps

export function FormField(props: FormFieldProps) {
  const {
    id,
    label,
    error,
    helperText,
    requiredIndicator = false,
    required,
    ...controlProps
  } = props

  const generatedId = useId()
  const fieldId = id ?? generatedId
  const errorId = `${fieldId}-error`
  const helperId = `${fieldId}-helper`

  const describedBy =
    [error ? errorId : null, helperText ? helperId : null]
      .filter(Boolean)
      .join(' ') || undefined

  const hasError = Boolean(error)

  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={fieldId}
        requiredIndicator={requiredIndicator || Boolean(required)}
      >
        {label}
      </Label>

      {'options' in controlProps && controlProps.options ? (
        <Select
          id={fieldId}
          hasError={hasError}
          required={required}
          aria-describedby={describedBy}
          {...(controlProps as Omit<SelectProps, 'id' | 'hasError'>)}
        />
      ) : (
        <Input
          id={fieldId}
          hasError={hasError}
          required={required}
          aria-describedby={describedBy}
          {...(controlProps as Omit<InputProps, 'id' | 'hasError'>)}
        />
      )}

      {helperText && (
        <p id={helperId} className="text-xs text-mist-gray">
          {helperText}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="text-sm text-crimson-bounty">
          {error}
        </p>
      )}
    </div>
  )
}
