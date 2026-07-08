using System.Threading.Tasks;

namespace InsuranceCompany.Services.Communications
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string body, string emailType, int userId);
    }
}
