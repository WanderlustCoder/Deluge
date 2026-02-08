using CuttingCount.Domain.Accounting;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CuttingCount.Infrastructure.Persistence.Configurations;

public sealed class TimberStandConfiguration : IEntityTypeConfiguration<TimberStand>
{
    public void Configure(EntityTypeBuilder<TimberStand> builder)
    {
        builder.ToTable("TimberStands");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.CompanyId).IsRequired();
        builder.Property(x => x.Location).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Species).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Acreage).HasColumnType("decimal(10,2)");
        builder.Property(x => x.EstimatedBoardFeet).HasColumnType("decimal(18,2)");
        builder.Property(x => x.AcquisitionCost).HasColumnType("decimal(18,2)");
        builder.Property(x => x.DepletionBasis).HasColumnType("decimal(18,2)");
        builder.Property(x => x.RemainingBasis).HasColumnType("decimal(18,2)");
        builder.Property(x => x.CreatedAtUtc).IsRequired();
        builder.Property(x => x.UpdatedAtUtc);

        builder.HasIndex(x => x.CompanyId);
    }
}
