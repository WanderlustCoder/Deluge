using CuttingCount.Domain.Banking;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CuttingCount.Infrastructure.Persistence.Configurations;

public sealed class BankConnectionProfileConfiguration : IEntityTypeConfiguration<BankConnectionProfile>
{
    public void Configure(EntityTypeBuilder<BankConnectionProfile> builder)
    {
        builder.ToTable("BankConnectionProfiles");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.CompanyId).IsRequired();
        builder.Property(x => x.InstitutionName).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Protocol).IsRequired();
        builder.Property(x => x.ConnectionConfigJson).HasMaxLength(4000);
        builder.Property(x => x.LastSyncAtUtc);
        builder.Property(x => x.Active).IsRequired();
        builder.Property(x => x.CreatedAtUtc).IsRequired();
        builder.Property(x => x.UpdatedAtUtc);

        builder.HasIndex(x => x.CompanyId);
    }
}
