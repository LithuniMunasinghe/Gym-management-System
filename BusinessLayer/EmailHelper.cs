using System;
using System.Net;
using System.Net.Mail;

// ── Reads these keys from Web.config <appSettings> ───────────────────────────
//   SmtpHost      → smtp.gmail.com
//   SmtpPort      → 587
//   SmtpUser      → your@gmail.com
//   SmtpPass      → 16-char Gmail App Password
//   SmtpFromEmail → noreply@dtsgym.com
//   SmtpFromName  → DTS Gym
// ─────────────────────────────────────────────────────────────────────────────

namespace WebApplication1.BusinessLayer
{
    public static class EmailHelper
    {
        private static string Cfg(string key)
            => System.Configuration.ConfigurationManager.AppSettings[key];

        private static string Host => Cfg("SmtpHost");
        private static int Port => int.Parse(Cfg("SmtpPort") ?? "587");
        private static string User => Cfg("SmtpUser");
        private static string Pass => Cfg("SmtpPass");
        private static string FromEmail => Cfg("SmtpFromEmail");
        private static string FromName => Cfg("SmtpFromName");

        // ─────────────────────────────────────────────────────────────────
        //  SEND PASSWORD RESET CODE
        //  Called by DAUser.RequestPasswordReset
        // ─────────────────────────────────────────────────────────────────
        public static bool SendPasswordResetCode(string toEmail, string toName, string code)
        {
            try
            {
                using (SmtpClient client = new SmtpClient(Host, Port))
                {
                    client.EnableSsl = true;
                    client.Credentials = new NetworkCredential(User, Pass);
                    client.DeliveryMethod = SmtpDeliveryMethod.Network;
                    client.Timeout = 15_000;

                    MailMessage msg = new MailMessage
                    {
                        From = new MailAddress(FromEmail, FromName),
                        Subject = "DTS Gym – Password Reset Code",
                        IsBodyHtml = true,
                        Body = BuildEmailHtml(toName, code),
                    };

                    msg.To.Add(new MailAddress(toEmail, toName ?? toEmail));
                    client.Send(msg);
                }
                return true;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Trace.TraceError(
                    $"[EmailHelper] SendPasswordResetCode failed for {toEmail}: {ex.Message}");
                return false;
            }
        }

        // ─────────────────────────────────────────────────────────────────
        //  HTML EMAIL TEMPLATE
        // ─────────────────────────────────────────────────────────────────
        private static string BuildEmailHtml(string name, string code) => $@"
<!DOCTYPE html>
<html>
<head><meta charset='utf-8'/></head>
<body style='margin:0;padding:0;background:#0d0d10;font-family:Arial,sans-serif;'>
  <table width='100%' cellpadding='0' cellspacing='0' style='padding:40px 0;'>
    <tr><td align='center'>
      <table width='480' cellpadding='0' cellspacing='0'
             style='background:#111116;border:1px solid #2a2a35;
                    border-radius:12px;overflow:hidden;'>

        <!-- ── Header ─────────────────────────────────────────────── -->
        <tr>
          <td style='background:#e8ff47;padding:22px 32px;'>
            <span style='font-size:20px;font-weight:900;color:#000;
                         letter-spacing:3px;'>DTS GYM</span>
            <span style='font-size:11px;color:#333;margin-left:10px;
                         letter-spacing:1px;'>MANAGEMENT SYSTEM</span>
          </td>
        </tr>

        <!-- ── Body ───────────────────────────────────────────────── -->
        <tr>
          <td style='padding:36px 32px 28px;'>
            <p style='color:#d0d0e0;font-size:15px;margin:0 0 10px;'>
              Hi <strong>{name ?? "there"}</strong>,
            </p>
            <p style='color:#8888a0;font-size:14px;margin:0 0 28px;line-height:1.65;'>
              We received a request to reset your
              <strong style='color:#d0d0e0;'>DTS Gym</strong> account password.
              Use the 6-digit code below — it expires in
              <strong style='color:#d0d0e0;'>10 minutes</strong>.
            </p>

            <!-- OTP box -->
            <div style='background:#1a1a24;border:1px solid #e8ff47;
                        border-radius:10px;padding:24px;
                        text-align:center;margin:0 0 28px;'>
              <div style='font-size:11px;color:#777;letter-spacing:2px;
                          text-transform:uppercase;margin-bottom:12px;'>
                Your Reset Code
              </div>
              <span style='font-size:40px;font-weight:900;letter-spacing:14px;
                           color:#e8ff47;font-family:Courier New,monospace;'>
                {code}
              </span>
            </div>

            <p style='color:#555568;font-size:12px;margin:0;line-height:1.6;'>
              If you did not request a password reset, you can safely ignore this email.
              Your password will not be changed.
            </p>
          </td>
        </tr>

        <!-- ── Footer ─────────────────────────────────────────────── -->
        <tr>
          <td style='padding:14px 32px;border-top:1px solid #1e1e28;
                     color:#444458;font-size:11px;text-align:center;'>
            &copy; {DateTime.UtcNow.Year} DTS Gym Management System
            &nbsp;|&nbsp; Do not reply to this email
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>";
    }
}