using CuttingCount.Domain.Accounting;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CuttingCount.Infrastructure.Persistence.Configurations;

public sealed class ClassAllocationRuleConfiguration : IEntityTypeConfiguration<ClassAllocationRule>
{
    public void Configure(EntityTypeBuilder<ClassAllocationRule> builder)
    {
        builder.ToTable("ClassAllocationRules");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.CompanyId).IsRequired();
        builder.Property(x => x.GlAccountPattern).IsRequired().HasMaxLength(50);
        builder.Property(x => x.ClassId).IsRequired();
        builder.Property(x => x.AllocationPercentage).HasColumnType("decimal(5,2)");
        builder.Property(x => x.EffectiveDate).IsRequired();
        builder.Property(x => x.CreatedAtUtc).IsRequired();
        builder.Property(x => x.UpdatedAtUtc);

        builder.HasIndex(x => x.CompanyId);
        builder.HasIndex(x => new { x.CompanyId, x.GlAccountPattern, x.ClassId }).IsUnique();
    }
}
