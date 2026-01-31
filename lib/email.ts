// ============================================================================
// Email Service (Placeholder - integrate with your email provider)
// ============================================================================

const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@wglifeos.com';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // TODO: Integrate with email service provider (e.g., SendGrid, Resend, AWS SES)
  // For now, just log the email
  console.log('📧 Sending email:', {
    from: EMAIL_FROM,
    to: options.to,
    subject: options.subject
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('Email content:', options.html);
  }

  // Simulate email sending
  return true;
}

// ============================================================================
// Email Templates
// ============================================================================

export async function sendVerificationEmail(email: string, token: string): Promise<boolean> {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - WG Life OS</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0F0F0F; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0F0F0F;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1A1A1A; border-radius: 8px; overflow: hidden;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #ccab52; padding: 32px 40px; text-align: center;">
                    <h1 style="margin: 0; color: #FFFFFF; font-size: 28px; font-weight: 700;">WG Life OS</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 24px 0; color: #F5F5F5; font-size: 24px; font-weight: 600;">Verify Your Email Address</h2>
                    
                    <p style="margin: 0 0 24px 0; color: #D1D1D1; font-size: 16px; line-height: 1.6;">
                      Thank you for registering with WG Life OS. To complete your registration and access your personal life operating system, please verify your email address.
                    </p>
                    
                    <div style="text-align: center; margin: 32px 0;">
                      <a href="${verificationUrl}" style="display: inline-block; background-color: #ccab52; color: #FFFFFF; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: 600;">
                        Verify Email Address
                      </a>
                    </div>
                    
                    <p style="margin: 32px 0 0 0; color: #A1A1A1; font-size: 14px; line-height: 1.6;">
                      If the button doesn't work, copy and paste this link into your browser:
                      <br>
                      <a href="${verificationUrl}" style="color: #ccab52; word-break: break-all;">${verificationUrl}</a>
                    </p>
                    
                    <p style="margin: 24px 0 0 0; color: #A1A1A1; font-size: 14px; line-height: 1.6;">
                      This link will expire in 24 hours.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #0F0F0F; padding: 24px 40px; text-align: center;">
                    <p style="margin: 0; color: #808080; font-size: 12px;">
                      If you didn't create an account with WG Life OS, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const text = `
    Verify Your Email Address
    
    Thank you for registering with WG Life OS. To complete your registration, please verify your email address by clicking the link below:
    
    ${verificationUrl}
    
    This link will expire in 24 hours.
    
    If you didn't create an account with WG Life OS, you can safely ignore this email.
  `;

  return sendEmail({
    to: email,
    subject: 'Verify Your Email - WG Life OS',
    html,
    text
  });
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - WG Life OS</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0F0F0F; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0F0F0F;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1A1A1A; border-radius: 8px; overflow: hidden;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #ccab52; padding: 32px 40px; text-align: center;">
                    <h1 style="margin: 0; color: #FFFFFF; font-size: 28px; font-weight: 700;">WG Life OS</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 24px 0; color: #F5F5F5; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
                    
                    <p style="margin: 0 0 24px 0; color: #D1D1D1; font-size: 16px; line-height: 1.6;">
                      We received a request to reset your password. Click the button below to choose a new password.
                    </p>
                    
                    <div style="text-align: center; margin: 32px 0;">
                      <a href="${resetUrl}" style="display: inline-block; background-color: #ccab52; color: #FFFFFF; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: 600;">
                        Reset Password
                      </a>
                    </div>
                    
                    <p style="margin: 32px 0 0 0; color: #A1A1A1; font-size: 14px; line-height: 1.6;">
                      If the button doesn't work, copy and paste this link into your browser:
                      <br>
                      <a href="${resetUrl}" style="color: #ccab52; word-break: break-all;">${resetUrl}</a>
                    </p>
                    
                    <p style="margin: 24px 0 0 0; color: #A1A1A1; font-size: 14px; line-height: 1.6;">
                      This link will expire in 1 hour.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #0F0F0F; padding: 24px 40px; text-align: center;">
                    <p style="margin: 0; color: #808080; font-size: 12px;">
                      If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const text = `
    Reset Your Password
    
    We received a request to reset your password. Click the link below to choose a new password:
    
    ${resetUrl}
    
    This link will expire in 1 hour.
    
    If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
  `;

  return sendEmail({
    to: email,
    subject: 'Reset Your Password - WG Life OS',
    html,
    text
  });
}
