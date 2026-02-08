using CuttingCount.Domain.Tax;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CuttingCount.Infrastructure.Persistence.Configurations;

public sealed class UseTaxLiabilityConfiguration : IEntityTypeConfiguration<UseTaxLiability>
{
    public void Configure(EntityTypeBuilder<UseTaxLiability> builder)
    {
        builder.ToTable("UseTaxLiabilities");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.CompanyId).IsRequired();
        builder.Property(x => x.VendorId);
        builder.Property(x => x.BillId);
        builder.Property(x => x.PurchaseAmount).HasColumnType("decimal(18,2)");
        builder.Property(x => x.TaxRate).HasColumnType("decimal(8,4)");
        builder.Property(x => x.UseTaxAmount).HasColumnType("decimal(18,2)");
        builder.Property(x => x.ReportPeriod).IsRequired();
        builder.Property(x => x.Reported).IsRequired();
        builder.Property(x => x.CreatedAtUtc).IsRequired();
        builder.Property(x => x.UpdatedAtUtc);

        builder.HasIndex(x => x.CompanyId);
        builder.HasIndex(x => new { x.CompanyId, x.ReportPeriod });
    }
}
