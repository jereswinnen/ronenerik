import { getServerSideURL } from '@/utilities/getURL'

export const forgotPasswordEmailSubject = (): string =>
  'Wachtwoord opnieuw instellen — Ron en Erik'

export const forgotPasswordEmailHTML = ({
  token,
  user,
}: {
  token?: string
  user?: { name?: string | null; email?: string | null }
}): string => {
  const url = `${getServerSideURL()}/account/wachtwoord-instellen?token=${token ?? ''}`
  const naam = user?.name?.trim() || 'daar'
  return `
<!doctype html>
<html lang="nl">
  <body style="font-family: -apple-system, system-ui, sans-serif; color: #111; max-width: 560px; margin: 0 auto; padding: 24px;">
    <h1 style="font-size: 20px;">Hoi ${naam},</h1>
    <p>Je vroeg een nieuw wachtwoord aan voor je <strong>Ron en Erik</strong>-account. Klik op de knop hieronder om er één in te stellen:</p>
    <p style="margin: 24px 0;">
      <a href="${url}" style="background: #111; color: #fff; padding: 12px 20px; border-radius: 6px; text-decoration: none; display: inline-block;">Stel een nieuw wachtwoord in</a>
    </p>
    <p style="color: #666; font-size: 14px;">Werkt de knop niet? Plak deze link in je browser:<br><a href="${url}">${url}</a></p>
    <p style="color: #666; font-size: 14px;">Heb jij dit niet aangevraagd? Dan kan je deze e-mail negeren.</p>
  </body>
</html>`
}
