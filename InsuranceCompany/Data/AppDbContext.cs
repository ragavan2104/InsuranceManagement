using Microsoft.EntityFrameworkCore;
using InsuranceCompany.Models.Authentication;
using InsuranceCompany.Models.Proposals;
using InsuranceCompany.Models.Operations;
using InsuranceCompany.Models.Communications;
using InsuranceCompany.Models.PolicyManagement;

namespace InsuranceCompany.Data
{
    public class AppDbContext :DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        public DbSet<Role> Roles { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<VehicleCategory> VehicleCategories { get; set; }
        public DbSet<AddOn> AddOns { get; set; }
        public DbSet<InsurancePolicy> InsurancePolicies { get; set; }
        public DbSet<PolicyAddOn> PolicyAddOns { get; set; }
        public DbSet<Proposal> Proposals { get; set; }
        public DbSet<ProposalAddOn> ProposalAddOns { get; set; }
        public DbSet<ProposalDocument> ProposalDocuments { get; set; }
        public DbSet<Quote> Quotes { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<IssuedPolicy> IssuedPolicies { get; set; }
        public DbSet<Claim> Claims { get; set; }

        public DbSet<EmailNotification> EmailNotifications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Proposal>()
                .HasOne(p => p.IssuedPolicy)
                .WithOne(i => i.Proposal)
                .HasForeignKey<IssuedPolicy>(i => i.ProposalId);
        }
    }
}
