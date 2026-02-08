using CuttingCount.Domain.Payments;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CuttingCount.Infrastructure.Persistence.Configurations;

public sealed class ChargebackDisputeConfiguration : IEntityTypeConfiguration<ChargebackDispute>
{
    public void Configure(EntityTypeBuilder<ChargebackDispute> builder)
    {
        builder.ToTable("ChargebackDisputes");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.ProcessorConfigId).IsRequired();
        builder.Property(x => x.TransactionReference).IsRequired().HasMaxLength(200);
        builder.Property(x => x.DisputeDate).IsRequired();
        builder.Property(x => x.Amount).HasColumnType("decimal(18,2)");
        builder.Property(x => x.Reason).IsRequired().HasMaxLength(500);
        builder.Property(x => x.EvidenceDeadline);
        builder.Property(x => x.Status).IsRequired();
        builder.Property(x => x.Resolution).HasMaxLength(500);
        builder.Property(x => x.CreatedAtUtc).IsRequired();
        builder.Property(x => x.UpdatedAtUtc);

        builder.HasOne<PaymentProcessorConfig>()
            .WithMany()
            .HasForeignKey(x => x.ProcessorConfigId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.ProcessorConfigId);
        builder.HasIndex(x => x.Status);
    }
}
