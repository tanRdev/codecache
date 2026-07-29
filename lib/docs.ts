export interface DocSection {
  title: string;
  slug: string;
  description?: string;
  items?: DocItem[];
}

export interface DocItem {
  title: string;
  slug: string;
  description?: string;
}

export const docNavigation: DocSection[] = [
  {
    title: "Getting Started",
    slug: "getting-started",
    description: "Install Cache and get a local library running",
    items: [
      { title: "Introduction", slug: "getting-started", description: "Overview of the self-hosted app and workflow" },
      { title: "Quick Start", slug: "getting-started/quickstart", description: "Create an owner, add a snippet, and search it back" },
      { title: "Installation", slug: "getting-started/installation", description: "Clone the repo, configure env vars, and start the app" },
    ],
  },
  {
    title: "CLI",
    slug: "cli",
    description: "Use Cache from a local profile or a remote server",
    items: [
      { title: "Overview", slug: "cli", description: "CLI modes, profiles, and everyday usage" },
      { title: "Commands", slug: "cli/commands", description: "Reference for snippet, attachment, auth, and storage commands" },
      { title: "Configuration", slug: "cli/configuration", description: "Where profiles live and how runtime selection works" },
      { title: "Authentication", slug: "cli/authentication", description: "Browser login and token-based remote access" },
    ],
  },
  {
    title: "API",
    slug: "api",
    description: "HTTP endpoints for snippets, attachments, auth, and storage",
    items: [
      { title: "Overview", slug: "api", description: "Auth model and endpoint groups" },
      { title: "Authentication", slug: "api/authentication", description: "Session cookies, bearer tokens, and CLI browser login helpers" },
      { title: "Endpoints", slug: "api/endpoints", description: "Reference for versioned API routes and health checks" },
      { title: "Error Handling", slug: "api/errors", description: "Common response shapes and failure cases" },
    ],
  },
  {
    title: "Web App",
    slug: "web",
    description: "Public pages, sign-in flow, dashboard, and snippet editing",
    items: [
      { title: "Overview", slug: "web", description: "How the web app is split between public and authenticated routes" },
      { title: "Dashboard", slug: "web/dashboard", description: "Browse, search, and open snippets" },
      { title: "Snippets", slug: "web/snippets", description: "Create, edit, attach files, and delete snippets" },
      { title: "Settings", slug: "web/settings", description: "What is configurable today and what still lives in env vars" },
    ],
  },
  {
    title: "Features",
    slug: "features",
    description: "Core product capabilities and current scope",
    items: [
      { title: "Overview", slug: "features", description: "Current capabilities across the browser, CLI, and API" },
      { title: "Snippet Management", slug: "features/snippets", description: "Create, edit, tag, and delete snippets" },
      { title: "Attachments", slug: "features/attachments", description: "Adding files to snippets" },
      { title: "Search", slug: "features/search", description: "Find snippets by text and tags" },
      { title: "Tags", slug: "features/tags", description: "Use tags for lightweight organization and filtering" },
      { title: "Storage", slug: "features/storage", description: "SQLite data, local files, and operational notes" },
      { title: "Security", slug: "features/security", description: "Owner auth, API tokens, and deployment safeguards" },
    ],
  },
];

export function getDocBySlug(slug: string): DocItem | undefined {
  for (const section of docNavigation) {
    if (section.slug === slug) {
      return { title: section.title, slug: section.slug, description: section.description };
    }
    for (const item of section.items || []) {
      if (item.slug === slug) {
        return item;
      }
    }
  }
  return undefined;
}
