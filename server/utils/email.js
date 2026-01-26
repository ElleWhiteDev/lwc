import sgMail from "@sendgrid/mail";

// Initialize SendGrid with API key
const apiKey = process.env.SENDGRID_API_KEY;

console.log("=== SendGrid Configuration ===");
console.log("API Key present:", !!apiKey);
console.log("API Key length:", apiKey ? apiKey.length : 0);
console.log("API Key starts with:", apiKey ? apiKey.substring(0, 10) + "..." : "N/A");

if (!apiKey) {
  console.error("❌ SENDGRID_API_KEY is not set in environment variables!");
} else {
  sgMail.setApiKey(apiKey);
  console.log("✅ SendGrid API key configured");
}

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "info@alwcwin.org";
const FROM_NAME = process.env.SENDGRID_FROM_NAME || "A Life Worth Celebrating";
const REPLY_TO = process.env.SENDGRID_REPLY_TO || "alifeworthcelebrating@gmail.com";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

console.log("From Email:", FROM_EMAIL);
console.log("From Name:", FROM_NAME);
console.log("Reply To:", REPLY_TO);
console.log("Frontend URL:", FRONTEND_URL);
console.log("==============================\n");

/**
 * Generic send email function
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content
 */
export async function sendEmail({ to, subject, html, text }) {
  console.log("\n=== Sending Email ===");
  console.log("To:", to);
  console.log("Subject:", subject);

  const msg = {
    to,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME,
    },
    replyTo: REPLY_TO,
    subject,
    text,
    html,
  };

  try {
    console.log("📧 Attempting to send email via SendGrid...");
    const response = await sgMail.send(msg);
    console.log("✅ Email sent successfully!");
    console.log("====================================\n");
    return response;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    if (error.response) {
      console.error("SendGrid error response body:", JSON.stringify(error.response.body, null, 2));
      console.error("SendGrid error response headers:", error.response.headers);
    }
    console.log("====================================\n");
    throw new Error("Failed to send email");
  }
}

/**
 * Send a welcome email to new users with password setup link
 * @param {string} to - Recipient email address
 * @param {string} resetToken - Password reset token
 * @param {string} userName - User's name
 */
export async function sendNewUserWelcomeEmail(to, resetToken, userName) {
  console.log("\\n=== Sending New User Welcome Email ===");
  console.log("To:", to);
  console.log("Name:", userName);
  console.log("Token:", resetToken);

  const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
  console.log("Setup URL:", resetUrl);

  const msg = {
    to,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME,
    },
    replyTo: REPLY_TO,
    subject: "Welcome to A Life Worth Celebrating!",
    text: `Welcome to A Life Worth Celebrating, ${userName}!

We're excited to have you join our community. An administrator has created an account for you to help manage our website and support our mission.

To get started, please set up your password by clicking the link below:

${resetUrl}

This link will expire in 1 hour for security purposes.

Once you've set your password, you'll be able to log in and access the admin panel to help manage events, content, and more.

If you have any questions or didn't expect this email, please contact us at ${REPLY_TO}.

Welcome aboard!

---
A Life Worth Celebrating
Creating inclusive spaces where every life is celebrated
${FRONTEND_URL}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #7B2D8E 0%, #9B4DB8 100%);
      color: white;
      padding: 40px 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
    }
    .header p {
      margin: 0;
      opacity: 0.9;
      font-size: 16px;
    }
    .content {
      background: #ffffff;
      padding: 40px 30px;
      border: 1px solid #e0e0e0;
      border-top: none;
    }
    .greeting {
      font-size: 18px;
      color: #7B2D8E;
      margin-bottom: 20px;
    }
    .button-container {
      text-align: center;
      margin: 35px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #7B2D8E 0%, #9B4DB8 100%);
      color: white;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 6px rgba(123, 45, 142, 0.3);
    }
    .info-box {
      background: #f9f5fb;
      border-left: 4px solid #7B2D8E;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .info-box p {
      margin: 0;
      font-size: 14px;
      color: #666;
    }
    .footer {
      background: #f5f5f5;
      padding: 30px 20px;
      text-align: center;
      font-size: 14px;
      color: #666;
      border-radius: 0 0 8px 8px;
      border: 1px solid #e0e0e0;
      border-top: none;
    }
    .footer strong {
      color: #7B2D8E;
      display: block;
      margin-bottom: 5px;
      font-size: 16px;
    }
    .footer a {
      color: #7B2D8E;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🌈 Welcome!</h1>
    <p>A Life Worth Celebrating</p>
  </div>
  <div class="content">
    <p class="greeting">Hello ${userName}!</p>

    <p>We're thrilled to welcome you to the A Life Worth Celebrating team! An administrator has created an account for you to help manage our website and support our mission of advancing inclusion, education, and community engagement.</p>

    <p style="margin-top: 20px;">To get started, please set up your password by clicking the button below:</p>

    <div class="button-container">
      <a href="${resetUrl}" class="button">Set Up My Password</a>
    </div>

    <div class="info-box">
      <p><strong>⏰ Important:</strong> This link will expire in 1 hour for security purposes. If it expires, you can request a new password reset link from the login page.</p>
    </div>

    <p>Once you've set your password, you'll be able to log in and access the admin panel where you can:</p>
    <ul style="margin: 15px 0; padding-left: 25px;">
      <li>Manage events and activities</li>
      <li>Update website content</li>
      <li>View community engagement metrics</li>
      <li>And more!</li>
    </ul>

    <p style="margin-top: 25px;">If you have any questions or didn't expect this email, please don't hesitate to reach out to us at <a href="mailto:${REPLY_TO}" style="color: #7B2D8E;">${REPLY_TO}</a>.</p>

    <p style="margin-top: 25px; font-weight: 600; color: #7B2D8E;">Welcome aboard! We're excited to have you with us.</p>
  </div>
  <div class="footer">
    <strong>A Life Worth Celebrating</strong>
    <p style="margin: 5px 0;">Creating inclusive spaces where every life is celebrated</p>
    <p style="margin: 15px 0;"><a href="${FRONTEND_URL}">${FRONTEND_URL}</a></p>
  </div>
</body>
</html>
    `,
  };

  console.log("Email message object:", JSON.stringify(msg, null, 2));

  try {
    console.log("\ud83d\udce7 Attempting to send welcome email via SendGrid...");
    const response = await sgMail.send(msg);
    console.log("\u2705 Welcome email sent successfully!");
    console.log("SendGrid Response:", JSON.stringify(response, null, 2));
    console.log("====================================\\n");
  } catch (error) {
    console.error("\u274c Error sending welcome email:", error);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    if (error.response) {
      console.error("SendGrid error response body:", JSON.stringify(error.response.body, null, 2));
      console.error("SendGrid error response headers:", error.response.headers);
    }
    console.log("====================================\\n");
    throw new Error("Failed to send welcome email");
  }
}

/**
 * Send a password reset email
 * @param {string} to - Recipient email address
 * @param {string} resetToken - Password reset token
 * @param {string} userName - User's name
 */
export async function sendPasswordResetEmail(to, resetToken, userName) {
  console.log("\n=== Sending Password Reset Email ===");
  console.log("To:", to);
  console.log("User Name:", userName);
  console.log("Reset Token:", resetToken);

  const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
  console.log("Reset URL:", resetUrl);

  const msg = {
    to,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME,
    },
    replyTo: REPLY_TO,
    subject: "Password Reset Request - A Life Worth Celebrating",
    text: `Hello ${userName},

We received a request to reset your password for your A Life Worth Celebrating account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request a password reset, you can safely ignore this email.

Best regards,
A Life Worth Celebrating Team`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #7B2D8E 0%, #9B4DB8 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background: #ffffff;
      padding: 30px;
      border: 1px solid #e0e0e0;
      border-top: none;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #7B2D8E 0%, #9B4DB8 100%);
      color: white !important;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
      font-weight: 600;
    }
    .footer {
      background: #f5f5f5;
      padding: 20px;
      text-align: center;
      font-size: 14px;
      color: #666;
      border-radius: 0 0 8px 8px;
      border: 1px solid #e0e0e0;
      border-top: none;
    }
    .warning {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 12px;
      margin: 20px 0;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0;">Password Reset Request</h1>
  </div>
  <div class="content">
    <p>Hello <strong>${userName}</strong>,</p>

    <p>We received a request to reset your password for your A Life Worth Celebrating account.</p>

    <p style="text-align: center;">
      <a href="${resetUrl}" class="button">Reset Your Password</a>
    </p>

    <div class="warning">
      <strong>⏱️ This link will expire in 1 hour</strong> for security reasons.
    </div>

    <p>If the button above doesn't work, copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #7B2D8E;">${resetUrl}</p>

    <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
      If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
    </p>
  </div>
  <div class="footer">
    <p style="margin: 0;">
      <strong>A Life Worth Celebrating</strong><br>
      Creating inclusive spaces where every life is celebrated
    </p>
  </div>
</body>
</html>
    `,
  };

  console.log("Email message object:", JSON.stringify(msg, null, 2));

  try {
    console.log("📧 Attempting to send email via SendGrid...");
    const response = await sgMail.send(msg);
    console.log("✅ Email sent successfully!");
    console.log("SendGrid Response:", JSON.stringify(response, null, 2));
    console.log(`Password reset email sent to ${to}`);
    console.log("====================================\n");
  } catch (error) {
    console.error("❌ Error sending password reset email:", error);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    if (error.response) {
      console.error("SendGrid error response body:", JSON.stringify(error.response.body, null, 2));
      console.error("SendGrid error response headers:", error.response.headers);
    }
    console.log("====================================\n");
    throw new Error("Failed to send password reset email");
  }
}

/**
 * Send a contact form submission email
 * @param {string} senderName - Name of the person sending the message
 * @param {string} senderEmail - Email of the person sending the message
 * @param {string} message - The message content
 */
export async function sendContactFormEmail(senderName, senderEmail, message) {
  console.log("\n=== Sending Contact Form Email ===");
  console.log("From:", senderName, "<" + senderEmail + ">");
  console.log("Message length:", message.length);

  const msg = {
    to: REPLY_TO, // Send to the organization's email
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME,
    },
    replyTo: senderEmail, // Reply goes to the person who submitted the form
    subject: `New Contact Form Submission from ${senderName}`,
    text: `You have received a new message from your website contact form.

From: ${senderName}
Email: ${senderEmail}

Message:
${message}

---
This message was sent via the contact form on ${FRONTEND_URL}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #7B2D8E 0%, #9B4DB8 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background: #ffffff;
      padding: 30px;
      border: 1px solid #e0e0e0;
      border-top: none;
    }
    .info-box {
      background: #f5f5f5;
      border-left: 4px solid #7B2D8E;
      padding: 15px;
      margin: 20px 0;
    }
    .message-box {
      background: #fafafa;
      border: 1px solid #e0e0e0;
      padding: 20px;
      margin: 20px 0;
      border-radius: 6px;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .footer {
      background: #f5f5f5;
      padding: 20px;
      text-align: center;
      font-size: 14px;
      color: #666;
      border-radius: 0 0 8px 8px;
      border: 1px solid #e0e0e0;
      border-top: none;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0;">New Contact Form Submission</h1>
  </div>
  <div class="content">
    <p>You have received a new message from your website contact form.</p>

    <div class="info-box">
      <p style="margin: 5px 0;"><strong>From:</strong> ${senderName}</p>
      <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${senderEmail}">${senderEmail}</a></p>
    </div>

    <h3>Message:</h3>
    <div class="message-box">${message}</div>

    <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 14px; color: #666;">
      This message was sent via the contact form on <a href="${FRONTEND_URL}">${FRONTEND_URL}</a>
    </p>
  </div>
  <div class="footer">
    <p style="margin: 0;">
      <strong>A Life Worth Celebrating</strong><br>
      Creating inclusive spaces where every life is celebrated
    </p>
  </div>
</body>
</html>
    `,
  };

  console.log("Email message object:", JSON.stringify(msg, null, 2));

  try {
    console.log("📧 Attempting to send contact form email via SendGrid...");
    const response = await sgMail.send(msg);
    console.log("✅ Contact form email sent successfully!");
    console.log("SendGrid Response:", JSON.stringify(response, null, 2));
    console.log("====================================\n");
  } catch (error) {
    console.error("❌ Error sending contact form email:", error);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    if (error.response) {
      console.error("SendGrid error response body:", JSON.stringify(error.response.body, null, 2));
      console.error("SendGrid error response headers:", error.response.headers);
    }
    console.log("====================================\n");
    throw new Error("Failed to send contact form email");
  }
}

/**
 * Send superuser access request email to admin
 * @param {string} userName - Name of user requesting access
 * @param {string} userEmail - Email of user requesting access
 * @param {string} currentRole - Current role of the user
 */
export async function sendSuperuserRequestEmail(userName, userEmail, currentRole) {
  console.log("\n=== Sending Superuser Request Email ===");
  console.log("User Name:", userName);
  console.log("User Email:", userEmail);
  console.log("Current Role:", currentRole);

  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.error("❌ ADMIN_EMAIL is not set in environment variables!");
    throw new Error("Admin email not configured");
  }

  const msg = {
    to: adminEmail,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME,
    },
    replyTo: userEmail,
    subject: "Superuser Access Request",
    text: `
Hello Admin,

${userName} (${userEmail}) has requested superuser access.

Current Role: ${currentRole}
Requested Role: Superuser

To grant this request, please log in to the admin panel and update their role to "Superuser" in the Users section.

Admin Panel: ${FRONTEND_URL}/admin

---
A Life Worth Celebrating
${FRONTEND_URL}
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Superuser Access Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                🌈 Superuser Access Request
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hello Admin,
              </p>

              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                <strong>${userName}</strong> has requested superuser access to the admin panel.
              </p>

              <table style="width: 100%; background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 20px 0;">
                <tr>
                  <td style="padding: 8px 0;">
                    <strong style="color: #667eea;">User Name:</strong>
                    <span style="color: #333333; margin-left: 10px;">${userName}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <strong style="color: #667eea;">Email:</strong>
                    <span style="color: #333333; margin-left: 10px;">${userEmail}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <strong style="color: #667eea;">Current Role:</strong>
                    <span style="color: #333333; margin-left: 10px;">${currentRole}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <strong style="color: #667eea;">Requested Role:</strong>
                    <span style="color: #333333; margin-left: 10px;">Superuser</span>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                To grant this request, please log in to the admin panel and update their role to "Superuser" in the Users section.
              </p>

              <table role="presentation" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${FRONTEND_URL}/admin" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      Go to Admin Panel
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px; color: #666666; font-size: 14px;">
                <strong>A Life Worth Celebrating</strong>
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                <a href="${FRONTEND_URL}" style="color: #667eea; text-decoration: none;">${FRONTEND_URL}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  };

  try {
    console.log("Sending superuser request email to:", adminEmail);
    const response = await sgMail.send(msg);
    console.log("✅ Superuser request email sent successfully!");
    console.log("SendGrid Response:", JSON.stringify(response, null, 2));
    console.log("====================================\n");
  } catch (error) {
    console.error("❌ Error sending superuser request email:", error);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    if (error.response) {
      console.error("SendGrid error response body:", JSON.stringify(error.response.body, null, 2));
      console.error("SendGrid error response headers:", error.response.headers);
    }
    console.log("====================================\n");
    throw new Error("Failed to send superuser request email");
  }
}
