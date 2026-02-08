using CuttingCount.Domain.Setup;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CuttingCount.Infrastructure.Persistence.Configurations;

public sealed class EmailTemplateConfiguration : IEntityTypeConfiguration<EmailTemplate>
{
    public void Configure(EntityTypeBuilder<EmailTemplate> builder)
    {
        builder.ToTable("EmailTemplates");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.CompanyId).IsRequired();
        builder.Property(x => x.TemplateKey).IsRequired().HasMaxLength(100);
        builder.Property(x => x.SubjectTemplate).IsRequired().HasMaxLength(500);
        builder.Property(x => x.BodyTemplate).IsRequired().HasMaxLength(8000);
        builder.Property(x => x.Format).IsRequired();
        builder.Property(x => x.Active).IsRequired();
        builder.Property(x => x.CreatedAtUtc).IsRequired();
        builder.Property(x => x.UpdatedAtUtc);

        builder.HasIndex(x => x.CompanyId);
        builder.HasIndex(x => new { x.CompanyId, x.TemplateKey }).IsUnique();
    }
}
