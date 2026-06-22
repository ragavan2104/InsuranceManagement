using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InsuranceCompany.Migrations
{
    /// <inheritdoc />
    public partial class AlterInsurancePolicyColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InsurancePolicies_Users_CreatorUserId",
                table: "InsurancePolicies");

            migrationBuilder.DropForeignKey(
                name: "FK_InsurancePolicies_VehicleCategories_VehicleCategoryCategoryId",
                table: "InsurancePolicies");

            migrationBuilder.DropIndex(
                name: "IX_InsurancePolicies_CreatorUserId",
                table: "InsurancePolicies");

            migrationBuilder.DropIndex(
                name: "IX_InsurancePolicies_VehicleCategoryCategoryId",
                table: "InsurancePolicies");

            migrationBuilder.DropColumn(
                name: "CreatorUserId",
                table: "InsurancePolicies");

            migrationBuilder.DropColumn(
                name: "VehicleCategoryCategoryId",
                table: "InsurancePolicies");

            migrationBuilder.RenameColumn(
                name: "PolicyDurationDays",
                table: "InsurancePolicies",
                newName: "PolicyDurationMonths");

            migrationBuilder.AddColumn<string>(
                name: "PolicyType",
                table: "InsurancePolicies",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_InsurancePolicies_CategoryId",
                table: "InsurancePolicies",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_InsurancePolicies_CreatedBy",
                table: "InsurancePolicies",
                column: "CreatedBy");

            migrationBuilder.AddForeignKey(
                name: "FK_InsurancePolicies_Users_CreatedBy",
                table: "InsurancePolicies",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_InsurancePolicies_VehicleCategories_CategoryId",
                table: "InsurancePolicies",
                column: "CategoryId",
                principalTable: "VehicleCategories",
                principalColumn: "CategoryId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InsurancePolicies_Users_CreatedBy",
                table: "InsurancePolicies");

            migrationBuilder.DropForeignKey(
                name: "FK_InsurancePolicies_VehicleCategories_CategoryId",
                table: "InsurancePolicies");

            migrationBuilder.DropIndex(
                name: "IX_InsurancePolicies_CategoryId",
                table: "InsurancePolicies");

            migrationBuilder.DropIndex(
                name: "IX_InsurancePolicies_CreatedBy",
                table: "InsurancePolicies");

            migrationBuilder.DropColumn(
                name: "PolicyType",
                table: "InsurancePolicies");

            migrationBuilder.RenameColumn(
                name: "PolicyDurationMonths",
                table: "InsurancePolicies",
                newName: "PolicyDurationDays");

            migrationBuilder.AddColumn<int>(
                name: "CreatorUserId",
                table: "InsurancePolicies",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "VehicleCategoryCategoryId",
                table: "InsurancePolicies",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_InsurancePolicies_CreatorUserId",
                table: "InsurancePolicies",
                column: "CreatorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_InsurancePolicies_VehicleCategoryCategoryId",
                table: "InsurancePolicies",
                column: "VehicleCategoryCategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_InsurancePolicies_Users_CreatorUserId",
                table: "InsurancePolicies",
                column: "CreatorUserId",
                principalTable: "Users",
                principalColumn: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_InsurancePolicies_VehicleCategories_VehicleCategoryCategoryId",
                table: "InsurancePolicies",
                column: "VehicleCategoryCategoryId",
                principalTable: "VehicleCategories",
                principalColumn: "CategoryId");
        }
    }
}
