import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key')

export async function sendEmail({ to, subject, html }: { to: string | string[], subject: string, html: string }) {
  if (!process.env.RESEND_API_KEY) {
    console.log('\n--- 📧 EMAIL STUB (Missing RESEND_API_KEY) ---')
    console.log(`To: ${Array.isArray(to) ? to.join(', ') : to}`)
    console.log(`Subject: ${subject}`)
    console.log(`Body: ${html.substring(0, 100)}...`)
    console.log('----------------------------------------------\n')
    return { success: true, stub: true }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Every Peso Counts <onboarding@resend.dev>', // Use onboarding@resend.dev for testing without verified domain
      to,
      subject,
      html
    })

    if (error) {
      console.error('Resend Error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (err: any) {
    console.error('Failed to send email:', err)
    return { success: false, error: err.message }
  }
}
