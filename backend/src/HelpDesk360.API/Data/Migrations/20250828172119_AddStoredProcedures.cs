using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HelpDesk360.API.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddStoredProcedures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "RequestDepartments",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "RequestDepartments",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "RequestDepartments",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "RequestDepartments",
                keyColumn: "Id",
                keyValue: 4);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "RequestDepartments",
                columns: new[] { "Id", "CreatedAt", "Description", "IsActive", "Name" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 8, 28, 0, 46, 30, 624, DateTimeKind.Utc).AddTicks(6990), "Information Technology support requests", true, "IT Support" },
                    { 2, new DateTime(2025, 8, 28, 0, 46, 30, 624, DateTimeKind.Utc).AddTicks(6990), "Human Resources related requests", true, "HR" },
                    { 3, new DateTime(2025, 8, 28, 0, 46, 30, 624, DateTimeKind.Utc).AddTicks(6990), "Financial and accounting requests", true, "Finance" },
                    { 4, new DateTime(2025, 8, 28, 0, 46, 30, 624, DateTimeKind.Utc).AddTicks(6990), "Office facilities and maintenance requests", true, "Facilities" }
                });
        }
    }
}
