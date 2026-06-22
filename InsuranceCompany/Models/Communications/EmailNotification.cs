using System;
using System.ComponentModel.DataAnnotations;
using InsuranceCompany.Models.Authentication;

namespace InsuranceCompany.Models.Communications
{
    public class EmailNotification
    {
        [Key]
        public int NotificationId { get; set; }
        public int UserId { get; set; }
        public string EmailType { get; set; } = string.Empty; 
        public string Subject { get; set; } = string.Empty;
        public DateTime SentAt { get; set; }
        public bool IsSent { get; set; }
        public virtual User? User { get; set; }
    }
}