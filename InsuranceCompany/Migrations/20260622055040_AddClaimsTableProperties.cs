using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InsuranceCompany.Migrations
{
    /// <inheritdoc />
    public partial class AddClaimsTableProperties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Claims_Users_ReviewedBy",
                table: "Claims");

            migrationBuilder.DropForeignKey(
                name: "FK_Claims_Users_UserId",
                table: "Claims");

            migrationBuilder.DropIndex(
                name: "IX_Claims_ReviewedBy",
                table: "Claims");

            migrationBuilder.DropIndex(
                name: "IX_Claims_UserId",
                table: "Claims");

            migrationBuilder.DropColumn(
                name: "ClaimAmount",
                table: "Claims");

            migrationBuilder.DropColumn(
                name: "ClaimDescription",
                table: "Claims");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Claims");

            migrationBuilder.RenameColumn(
                name: "ReviewedBy",
                table: "Claims",
                newName: "ReviewedByOfficerId");

            migrationBuilder.AddColumn<decimal>(
                name: "ApprovedSettlementAmount",
                table: "Claims",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "EstimatedLossAmount",
                table: "Claims",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "FiledAt",
                table: "Claims",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "IncidentDescription",
                table: "Claims",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Claims",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApprovedSettlementAmount",
                table: "Claims");

            migrationBuilder.DropColumn(
                name: "EstimatedLossAmount",
                table: "Claims");

            migrationBuilder.DropColumn(
                name: "FiledAt",
                table: "Claims");

            migrationBuilder.DropColumn(
                name: "IncidentDescription",
                table: "Claims");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Claims");

            migrationBuilder.RenameColumn(
                name: "ReviewedByOfficerId",
                table: "Claims",
                newName: "ReviewedBy");

            migrationBuilder.AddColumn<decimal>(
                name: "ClaimAmount",
                table: "Claims",
                type: "decimal(15,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "ClaimDescription",
                table: "Claims",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Claims",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Claims_ReviewedBy",
                table: "Claims",
                column: "ReviewedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Claims_UserId",
                table: "Claims",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Claims_Users_ReviewedBy",
                table: "Claims",
                column: "ReviewedBy",
                principalTable: "Users",
                principalColumn: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Claims_Users_UserId",
                table: "Claims",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
