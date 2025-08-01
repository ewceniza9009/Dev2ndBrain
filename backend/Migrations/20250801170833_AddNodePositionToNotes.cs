using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddNodePositionToNotes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Fx",
                table: "Notes",
                type: "REAL",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Fy",
                table: "Notes",
                type: "REAL",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "X",
                table: "Notes",
                type: "REAL",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Y",
                table: "Notes",
                type: "REAL",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Fx",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "Fy",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "X",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "Y",
                table: "Notes");
        }
    }
}
