using CuttingCount.Domain.Tax;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CuttingCount.Infrastructure.Persistence.Configurations;

public sealed class BackupWithholdingRecordConfiguration : IEntityTypeConfiguration<BackupWithholdingRecord>
{
    public void Configure(EntityTypeBuilder<BackupWithholdingRecord> builder)
    {
        builder.ToTable("BackupWithholdingRecords");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.VendorId).IsRequired();
        builder.Property(x => x.PaymentId);
        builder.Property(x => x.GrossAmount).HasColumnType("decimal(18,2)");
        builder.Property(x => x.WithholdingRate).HasColumnType("decimal(8,4)");
        builder.Property(x => x.AmountWithheld).HasColumnType("decimal(18,2)");
        builder.Property(x => x.ReportingPeriod).IsRequired();
        builder.Property(x => x.CreatedAtUtc).IsRequired();
        builder.Property(x => x.UpdatedAtUtc);

        builder.HasIndex(x => x.VendorId);
        builder.HasIndex(x => x.ReportingPeriod);
    }
}
