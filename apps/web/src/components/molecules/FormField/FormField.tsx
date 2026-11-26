import { useId } from 'react'
import { Input } from '../../atoms/Input'
import type { InputProps } from '../../atoms/Input'
import { Label } from '../../atoms/Label'
import { Select } from '../../atoms/Select'
import type { SelectOption, SelectProps } from '../../atoms/Select'
import { Textarea } from '../../atoms/Textarea'
import type { TextareaProps } from '../../atoms/Textarea'

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
    multiline?: false
  }

type SelectFormFieldProps = BaseFormFieldProps &
  Omit<SelectProps, 'id' | 'hasError' | 'options'> & {
    options: readonly SelectOption[]
    multiline?: false
  }

type TextareaFormFieldProps = BaseFormFieldProps &
  Omit<TextareaProps, 'id' | 'hasError'> & {
    multiline: true
    options?: undefined
  }

export type FormFieldProps =
  | InputFormFieldProps
  | SelectFormFieldProps
  | TextareaFormFieldProps

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

  function renderControl() {
    if ('multiline' in controlProps && controlProps.multiline) {
      const { multiline: _multiline, ...textareaProps } = controlProps
      void _multiline
      return (
        <Textarea
          id={fieldId}
          hasError={hasError}
          required={required}
          aria-describedby={describedBy}
          {...(textareaProps as Omit<TextareaProps, 'id' | 'hasError'>)}
        />
      )
    }

    if ('options' in controlProps && controlProps.options) {
      const { multiline: _multiline, ...selectProps } = controlProps
      void _multiline
      return (
        <Select
          id={fieldId}
          hasError={hasError}
          required={required}
          aria-describedby={describedBy}
          {...(selectProps as Omit<SelectProps, 'id' | 'hasError'>)}
        />
      )
    }

    const { multiline: _multiline, ...inputProps } = controlProps
    void _multiline
    return (
      <Input
        id={fieldId}
        hasError={hasError}
        required={required}
        aria-describedby={describedBy}
        {...(inputProps as Omit<InputProps, 'id' | 'hasError'>)}
      />
    )
  }

  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={fieldId}
        requiredIndicator={requiredIndicator || Boolean(required)}
      >
        {label}
      </Label>

      {renderControl()}

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
