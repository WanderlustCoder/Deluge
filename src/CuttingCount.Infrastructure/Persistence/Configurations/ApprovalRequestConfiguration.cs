using CuttingCount.Domain.Shared;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CuttingCount.Infrastructure.Persistence.Configurations;

public sealed class ApprovalRequestConfiguration : IEntityTypeConfiguration<ApprovalRequest>
{
    public void Configure(EntityTypeBuilder<ApprovalRequest> builder)
    {
        builder.ToTable("ApprovalRequests");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.WorkflowId).IsRequired();
        builder.Property(x => x.EntityId).IsRequired();
        builder.Property(x => x.EntityType).IsRequired().HasMaxLength(100);
        builder.Property(x => x.RequestedBy).IsRequired().HasMaxLength(200);
        builder.Property(x => x.CurrentStepOrder).IsRequired();
        builder.Property(x => x.Status).IsRequired();
        builder.Property(x => x.DecisionBy).HasMaxLength(200);
        builder.Property(x => x.DecisionReason).HasMaxLength(500);
        builder.Property(x => x.DecidedAtUtc);
        builder.Property(x => x.CreatedAtUtc).IsRequired();
        builder.Property(x => x.UpdatedAtUtc);

        builder.HasOne<ApprovalWorkflow>()
            .WithMany()
            .HasForeignKey(x => x.WorkflowId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.EntityType, x.EntityId });
        builder.HasIndex(x => x.Status);
    }
}
