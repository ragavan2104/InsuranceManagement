using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InsuranceCompany.Migrations
{
    /// <inheritdoc />
    public partial class addedpolicynumber : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UniqueIssuedCode",
                table: "IssuedPolicies",
                newName: "PolicyNumber");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PolicyNumber",
                table: "IssuedPolicies",
                newName: "UniqueIssuedCode");
        }
    }
}
