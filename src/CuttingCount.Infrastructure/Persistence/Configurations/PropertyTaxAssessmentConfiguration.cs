using CuttingCount.Domain.Accounting;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CuttingCount.Infrastructure.Persistence.Configurations;

public sealed class PropertyTaxAssessmentConfiguration : IEntityTypeConfiguration<PropertyTaxAssessment>
{
    public void Configure(EntityTypeBuilder<PropertyTaxAssessment> builder)
    {
        builder.ToTable("PropertyTaxAssessments");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.CompanyId).IsRequired();
        builder.Property(x => x.PropertyDescription).IsRequired().HasMaxLength(500);
        builder.Property(x => x.Jurisdiction).IsRequired().HasMaxLength(200);
        builder.Property(x => x.TaxYear).IsRequired();
        builder.Property(x => x.AssessedValue).HasColumnType("decimal(18,2)");
        builder.Property(x => x.TaxRate).HasColumnType("decimal(8,4)");
        builder.Property(x => x.AmountDue).HasColumnType("decimal(18,2)");
        builder.Property(x => x.AppealStatus).IsRequired();
        builder.Property(x => x.CreatedAtUtc).IsRequired();
        builder.Property(x => x.UpdatedAtUtc);

        builder.HasIndex(x => x.CompanyId);
        builder.HasIndex(x => new { x.CompanyId, x.TaxYear });
    }
}
