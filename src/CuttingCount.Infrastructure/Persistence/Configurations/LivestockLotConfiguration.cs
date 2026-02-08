using CuttingCount.Domain.Inventory;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CuttingCount.Infrastructure.Persistence.Configurations;

public sealed class LivestockLotConfiguration : IEntityTypeConfiguration<LivestockLot>
{
    public void Configure(EntityTypeBuilder<LivestockLot> builder)
    {
        builder.ToTable("LivestockLots");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.CompanyId).IsRequired();
        builder.Property(x => x.Breed).IsRequired().HasMaxLength(100);
        builder.Property(x => x.HeadCount).IsRequired();
        builder.Property(x => x.AcquisitionDate).IsRequired();
        builder.Property(x => x.CostBasis).HasColumnType("decimal(18,2)");
        builder.Property(x => x.ValuationMethod).IsRequired();
        builder.Property(x => x.Location).HasMaxLength(200);
        builder.Property(x => x.CreatedAtUtc).IsRequired();
        builder.Property(x => x.UpdatedAtUtc);

        builder.HasIndex(x => x.CompanyId);
    }
}
