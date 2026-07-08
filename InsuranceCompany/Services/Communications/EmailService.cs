using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using InsuranceCompany.Data;
using InsuranceCompany.Models.Communications;
using Microsoft.Extensions.Configuration;
using log4net;

namespace InsuranceCompany.Services.Communications
{
    public class EmailService : IEmailService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;
        private static readonly ILog _log = LogManager.GetLogger(typeof(EmailService));

        public EmailService(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body, string emailType, int userId)
        {
            bool isSent = false;
            try
            {
                _log.Info($"Attempting to send {emailType} email to: {toEmail} (UserId: {userId})");

                var smtpServer = _config["SmtpSettings:Server"] ?? "sandbox.smtp.mailtrap.io";
                var smtpPortStr = _config["SmtpSettings:Port"] ?? "2525";
                var smtpUsername = _config["SmtpSettings:Username"] ?? string.Empty;
                var smtpPassword = _config["SmtpSettings:Password"] ?? string.Empty;
                var senderEmail = _config["SmtpSettings:SenderEmail"] ?? "no-reply@autoshield.com";
                var senderName = _config["SmtpSettings:SenderName"] ?? "AutoShield Protection";

                int.TryParse(smtpPortStr, out int smtpPort);
                if (smtpPort == 0) smtpPort = 2525;

                using (var mailMessage = new MailMessage())
                {
                    mailMessage.From = new MailAddress(senderEmail, senderName);
                    mailMessage.To.Add(toEmail);
                    mailMessage.Subject = subject;
                    mailMessage.Body = body;
                    mailMessage.IsBodyHtml = true;

                    using (var smtpClient = new SmtpClient(smtpServer, smtpPort))
                    {
                        smtpClient.EnableSsl = true;
                        smtpClient.UseDefaultCredentials = false;
                        smtpClient.Credentials = new NetworkCredential(smtpUsername, smtpPassword);

                        await smtpClient.SendMailAsync(mailMessage);
                        isSent = true;
                        _log.Info($"Successfully sent email to {toEmail} via Mailtrap.");
                    }
                }
            }
            catch (Exception ex)
            {
                _log.Error($"Failed to send email to {toEmail}. Error: {ex.Message}", ex);
            }
            finally
            {
                try
                {
                    var notification = new EmailNotification
                    {
                        UserId = userId,
                        EmailType = emailType,
                        Subject = subject,
                        SentAt = DateTime.Now,
                        IsSent = isSent
                    };
                    _context.EmailNotifications.Add(notification);
                    await _context.SaveChangesAsync();
                }
                catch (Exception dbEx)
                {
                    _log.Error($"Failed to save email notification record in database: {dbEx.Message}", dbEx);
                }
            }
        }
    }
}
