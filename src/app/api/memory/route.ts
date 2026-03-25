export async function GET() {
  return Response.json({
    files: [
      {
        name: 'user_role.md',
        type: 'user',
        description: 'Information about the user role and preferences',
        content: '---\nname: User Role\ndescription: Primary user role and context\ntype: user\n---\n\nSenior software engineer working on agent orchestration platform.\nPrefers concise communication and minimal abstractions.',
        updatedAt: '2 hours ago',
      },
      {
        name: 'feedback_testing.md',
        type: 'feedback',
        description: 'Testing preferences and guidelines',
        content: '---\nname: Testing Preferences\ndescription: How the user wants tests structured\ntype: feedback\n---\n\nUse integration tests against real services, not mocks.\n\n**Why:** Mock/prod divergence caused a broken migration last quarter.\n**How to apply:** Always write integration tests for API routes and database operations.',
        updatedAt: '1 day ago',
      },
      {
        name: 'project_auth_rewrite.md',
        type: 'project',
        description: 'Auth middleware rewrite context',
        content: '---\nname: Auth Middleware Rewrite\ndescription: Context for the ongoing auth system changes\ntype: project\n---\n\nAuth middleware rewrite driven by legal/compliance requirements.\n\n**Why:** Legal flagged session token storage as non-compliant.\n**How to apply:** Scope decisions should favor compliance over ergonomics.',
        updatedAt: '3 days ago',
      },
      {
        name: 'reference_linear.md',
        type: 'reference',
        description: 'Linear project tracking reference',
        content: '---\nname: Linear Project\ndescription: Where pipeline bugs are tracked\ntype: reference\n---\n\nPipeline bugs tracked in Linear project "INGEST".\nAgent issues tracked in Linear project "AGENTS".',
        updatedAt: '1 week ago',
      },
    ],
  })
}
