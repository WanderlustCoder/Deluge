using CuttingCount.Domain.Purchasing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CuttingCount.Infrastructure.Persistence.Configurations;

public sealed class PayrollJournalTemplateConfiguration : IEntityTypeConfiguration<PayrollJournalTemplate>
{
    public void Configure(EntityTypeBuilder<PayrollJournalTemplate> builder)
    {
        builder.ToTable("PayrollJournalTemplates");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.ProviderId).IsRequired();
        builder.Property(x => x.PayrollComponent).IsRequired().HasMaxLength(100);
        builder.Property(x => x.DebitAccountNumber).IsRequired();
        builder.Property(x => x.CreditAccountNumber).IsRequired();
        builder.Property(x => x.DescriptionTemplate).HasMaxLength(500);
        builder.Property(x => x.CreatedAtUtc).IsRequired();
        builder.Property(x => x.UpdatedAtUtc);

        builder.HasOne<PayrollProvider>()
            .WithMany()
            .HasForeignKey(x => x.ProviderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.ProviderId);
        builder.HasIndex(x => new { x.ProviderId, x.PayrollComponent }).IsUnique();
    }
}
