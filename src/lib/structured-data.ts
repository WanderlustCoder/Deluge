interface ProjectData {
  id: string;
  title: string;
  description: string;
  category: string;
  fundingGoal: number;
  fundingRaised: number;
  backerCount: number;
  status: string;
  location: string;
  createdAt: Date;
}

export function generateProjectJsonLd(project: ProjectData) {
  return {
    "@context": "https://schema.org",
    "@type": "FundingScheme",
    name: project.title,
    description: project.description,
    url: `https://deluge.fund/projects/${project.id}`,
    category: project.category,
    location: {
      "@type": "Place",
      name: project.location,
    },
    funding: {
      "@type": "MonetaryGrant",
      amount: {
        "@type": "MonetaryAmount",
        value: project.fundingGoal,
        currency: "USD",
      },
    },
    funder: {
      "@type": "Organization",
      name: "Deluge",
      url: "https://deluge.fund",
    },
    dateCreated: project.createdAt.toISOString(),
    status:
      project.status === "funded"
        ? "https://schema.org/CompletedActionStatus"
        : "https://schema.org/ActiveActionStatus",
  };
}
