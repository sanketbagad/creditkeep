export const getPasswordResetEmailHtml = (resetLink: string, userName: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding: 20px 0;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border-radius: 8px 8px 0 0;
          margin: -20px -20px 20px;
        }
        .header h1 {
          color: white;
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 20px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
          margin: 20px 0;
          text-align: center;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          color: #666;
        }
        .note {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 4px;
          font-size: 14px;
          margin: 20px 0;
          border-left: 4px solid #6366f1;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hello ${userName},</p>
          <p>We received a request to reset your password for your CreditKeep account. To reset your password, please click the button below:</p>
          
          <div style="text-align: center;">
            <a href="${resetLink}" class="button">Reset Password</a>
          </div>
          
          <div class="note">
            <p><strong>Note:</strong> This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
          </div>
          
          <p>Thank you,<br>The CreditKeep Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} CreditKeep. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export const getPasswordResetSuccessEmailHtml = (userName: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Successful</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding: 20px 0;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 8px 8px 0 0;
          margin: -20px -20px 20px;
        }
        .header h1 {
          color: white;
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 20px;
        }
        .success-icon {
          text-align: center;
          font-size: 48px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Successful</h1>
        </div>
        <div class="content">
          <div class="success-icon">✅</div>
          <p>Hello ${userName},</p>
          <p>Your password has been successfully reset. You can now log in to your account with your new password.</p>
          
          <p>If you did not make this change, please contact our support team immediately.</p>
          
          <p>Thank you,<br>The CreditKeep Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} CreditKeep. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export const getOTPEmailHtml = (otp: string, userName: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding: 20px 0;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 8px 8px 0 0;
          margin: -20px -20px 20px;
        }
        .header h1 {
          color: white;
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 20px;
          text-align: center;
        }
        .otp-code {
          font-size: 36px;
          font-weight: bold;
          color: #10b981;
          background-color: #f0fdf4;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          letter-spacing: 8px;
          border: 2px dashed #10b981;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          color: #666;
        }
        .note {
          background-color: #fef3c7;
          padding: 15px;
          border-radius: 4px;
          font-size: 14px;
          margin: 20px 0;
          border-left: 4px solid #f59e0b;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Email Verification</h1>
        </div>
        <div class="content">
          <p>Hello ${userName},</p>
          <p>Welcome to CreditKeep! To complete your registration, please verify your email address using the OTP code below:</p>
          
          <div class="otp-code">${otp}</div>
          
          <div class="note">
            <p><strong>⏰ Important:</strong> This OTP will expire in 10 minutes for security reasons.</p>
            <p>If you didn't create an account, please ignore this email.</p>
          </div>
          
          <p>Enter this code on the verification page to activate your account.</p>
          
          <p>Thank you,<br>The CreditKeep Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} CreditKeep. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
