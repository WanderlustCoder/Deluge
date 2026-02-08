using CuttingCount.Domain.Accounting;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CuttingCount.Infrastructure.Persistence.Configurations;

public sealed class RoyaltyContractConfiguration : IEntityTypeConfiguration<RoyaltyContract>
{
    public void Configure(EntityTypeBuilder<RoyaltyContract> builder)
    {
        builder.ToTable("RoyaltyContracts");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.ResourceId).IsRequired();
        builder.Property(x => x.Counterparty).IsRequired().HasMaxLength(200);
        builder.Property(x => x.RoyaltyRate).HasColumnType("decimal(8,4)");
        builder.Property(x => x.MinimumPayment).HasColumnType("decimal(18,2)");
        builder.Property(x => x.TermStart).IsRequired();
        builder.Property(x => x.TermEnd).IsRequired();
        builder.Property(x => x.Active).IsRequired();
        builder.Property(x => x.CreatedAtUtc).IsRequired();
        builder.Property(x => x.UpdatedAtUtc);

        builder.HasIndex(x => x.ResourceId);
    }
}
