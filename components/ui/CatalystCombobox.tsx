// @ts-nocheck
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { useState } from 'react'
import { cn } from '../../lib/utils'

export interface CatalystComboboxOption {
  value: string | number
  label: string
}

interface CatalystComboboxProps {
  options: CatalystComboboxOption[]
  value?: string | number | null
  onChange: (value: string | number | null) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  inputClassName?: string
}

export function CatalystCombobox({
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  className,
  disabled = false,
  inputClassName,
}: CatalystComboboxProps) {
  const [query, setQuery] = useState('')

  const selectedOption = options.find((option) => option.value === value)

  const filteredOptions =
    query === ''
      ? options
      : options.filter((option) => {
          return option.label.toLowerCase().includes(query.toLowerCase())
        })

  return (
    <Combobox
      value={selectedOption}
      onChange={(option: CatalystComboboxOption | null) => {
        onChange(option?.value || null)
        setQuery('')
      }}
      disabled={disabled}
    >
      <div className={cn("relative", className)}>
        <ComboboxInput
          className={cn(
            "w-full rounded-lg border border-[#D5D8DC] bg-white py-2 pl-3 pr-10 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3A6EA5]/40 focus:border-[#3A6EA5]",
            inputClassName
          )}
          displayValue={(option: CatalystComboboxOption) => option?.label || ''}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
        />
        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronUpDownIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
        </ComboboxButton>

        <ComboboxOptions className="absolute z-[9999] mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none">
          {filteredOptions.length === 0 && query !== '' ? (
            <div className="relative cursor-default select-none px-4 py-2 text-slate-500">
              Nenhum resultado encontrado.
            </div>
          ) : (
            filteredOptions.map((option) => (
              <ComboboxOption
                key={option.value}
                value={option}
                className={({ focus }) =>
                  cn(
                    'relative cursor-default select-none py-2 pl-3 pr-9',
                    focus ? 'bg-[#3A6EA5] text-white' : 'text-slate-900'
                  )
                }
              >
                {({ focus, selected }) => (
                  <>
                    <span className={cn('block truncate', selected && 'font-semibold')}>
                      {option.label}
                    </span>

                    {selected && (
                      <span
                        className={cn(
                          'absolute inset-y-0 right-0 flex items-center pr-4',
                          focus ? 'text-white' : 'text-[#3A6EA5]'
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </ComboboxOption>
            ))
          )}
        </ComboboxOptions>
      </div>
    </Combobox>
  )
}
