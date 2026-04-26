'use client'

import React from 'react'

export function AuthShell({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="max-w-md mx-auto flex flex-col gap-6 px-4 py-12 md:py-20">
      <h1 className="text-2xl font-bold">{title}</h1>
      {children}
    </section>
  )
}

export function AuthField({
  label,
  name,
  type = 'text',
  required,
  autoComplete,
  defaultValue,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  autoComplete?: string
  defaultValue?: string
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span>
        {label}
        {required ? ' *' : ''}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        className="border border-c-foreground/20 rounded px-3 py-2 bg-c-background"
      />
    </label>
  )
}

export function AuthButton({
  children,
  pending,
}: {
  children: React.ReactNode
  pending?: boolean
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-c-foreground text-c-background rounded px-4 py-2 font-medium disabled:opacity-50"
    >
      {pending ? 'Bezig…' : children}
    </button>
  )
}

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p role="alert" className="text-sm text-red-600">
      {message}
    </p>
  )
}

export function AuthSuccess({ message }: { message: string }) {
  return (
    <p role="status" className="text-sm text-green-700">
      {message}
    </p>
  )
}
