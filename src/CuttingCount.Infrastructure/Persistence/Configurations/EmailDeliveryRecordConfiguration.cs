using CuttingCount.Domain.Setup;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CuttingCount.Infrastructure.Persistence.Configurations;

public sealed class EmailDeliveryRecordConfiguration : IEntityTypeConfiguration<EmailDeliveryRecord>
{
    public void Configure(EntityTypeBuilder<EmailDeliveryRecord> builder)
    {
        builder.ToTable("EmailDeliveryRecords");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.TemplateId);
        builder.Property(x => x.Recipient).IsRequired().HasMaxLength(500);
        builder.Property(x => x.Subject).IsRequired().HasMaxLength(500);
        builder.Property(x => x.Status).IsRequired();
        builder.Property(x => x.SentAtUtc);
        builder.Property(x => x.ProviderMessageId).HasMaxLength(200);
        builder.Property(x => x.ErrorMessage).HasMaxLength(1000);
        builder.Property(x => x.CreatedAtUtc).IsRequired();
        builder.Property(x => x.UpdatedAtUtc);

        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.Recipient);
    }
}
