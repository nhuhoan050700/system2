'use client'

import { GoogleOAuthProvider } from '@react-oauth/google'

interface GoogleOAuthProviderWrapperProps {
  clientId: string
  children: React.ReactNode
}

export default function GoogleOAuthProviderWrapper({
  clientId,
  children,
}: GoogleOAuthProviderWrapperProps) {
  // Only render GoogleOAuthProvider if clientId is provided
  if (!clientId || clientId.trim() === '') {
    return <>{children}</>
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  )
}
