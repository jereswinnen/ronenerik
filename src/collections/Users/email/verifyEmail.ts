import { getServerSideURL } from '@/utilities/getURL'

export const verifyEmailSubject = (): string =>
  'Bevestig je e-mailadres voor Ron en Erik'

export const verifyEmailHTML = ({
  token,
  user,
}: {
  token?: string
  user?: { name?: string | null; email?: string | null }
}): string => {
  const url = `${getServerSideURL()}/account/verifieer?token=${token ?? ''}`
  const naam = user?.name?.trim() || 'daar'
  return `
<!doctype html>
<html lang="nl">
  <body style="font-family: -apple-system, system-ui, sans-serif; color: #111; max-width: 560px; margin: 0 auto; padding: 24px;">
    <h1 style="font-size: 20px;">Hoi ${naam},</h1>
    <p>Bedankt om een account te maken op <strong>Ron en Erik</strong>. Klik op de knop hieronder om je e-mailadres te bevestigen:</p>
    <p style="margin: 24px 0;">
      <a href="${url}" style="background: #111; color: #fff; padding: 12px 20px; border-radius: 6px; text-decoration: none; display: inline-block;">Bevestig mijn e-mailadres</a>
    </p>
    <p style="color: #666; font-size: 14px;">Werkt de knop niet? Plak deze link in je browser:<br><a href="${url}">${url}</a></p>
    <p style="color: #666; font-size: 14px;">Heb jij dit niet aangevraagd? Negeer deze e-mail dan gewoon.</p>
  </body>
</html>`
}
