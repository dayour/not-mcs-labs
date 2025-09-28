# GitHub Copilot Instructions for Microsoft Copilot Studio Labs

## Repository Overview

This repository contains hands-on lab materials for Microsoft Copilot Studio, designed to teach users how to build, configure, and deploy AI agents. The labs range from beginner to advanced levels and cover various scenarios including conversational agents, autonomous agents, and enterprise integrations.

## Repository Structure

```
not-mcs-labs/
├── labs/                          # Main lab content directory
│   ├── lab-template.md           # Standard template for creating new labs
│   ├── [lab-name]/               # Individual lab directories
│   │   ├── README.md             # Lab instructions and content
│   │   ├── images/               # Screenshots and visual assets
│   │   └── [additional-files]    # Lab-specific resources
├── README.md                     # Repository overview with lab catalog
├── LICENSE                       # Repository license
└── SECURITY.md                   # Security policies
```

## Content Standards and Conventions

### Lab Structure
All labs follow a standardized structure based on `lab-template.md`:

1. **Header Section**: Title, description, and lab details table
2. **Table of Contents**: Standardized navigation
3. **Introduction Sections**: Context, concepts, prerequisites
4. **Use Cases**: Step-by-step instructions organized by use case
5. **Summary**: Key learnings and recommendations

### Markdown Conventions
- Use emoji indicators for sections (🧭, 📚, 🌐, 🎓, 🛠️, etc.)
- Numbered steps for sequential actions
- Code blocks for copyable content
- Admonition blocks for tips, warnings, and important notes:
  - `> [!TIP]` for helpful guidance
  - `> [!IMPORTANT]` for critical information
  - `> [!WARNING]` for potential issues

### Image and Asset Guidelines
- Store images in `labs/[lab-name]/images/` directory
- Use descriptive filenames (e.g., `agent-builder.png`, `configuration-screen.jpg`)
- Reference images with relative paths: `![alt text](images/filename.png)`
- Prefer PNG for screenshots, JPG for photos
- Include meaningful alt text for accessibility

### Content Types and Patterns

#### Lab Metadata
Each lab includes a standardized details table:
```markdown
| Level | Persona | Duration | Purpose |
| ----- | ------- | -------- | ------- |
| [100/200/300] | [Maker/Developer/Admin] | [X minutes] | [Learning outcomes] |
```

#### Use Case Organization
Labs are organized into discrete use cases with:
- Clear objectives and value propositions
- Step-by-step instructions with screenshots
- Verification steps and expected outcomes
- Troubleshooting guidance

#### Code and Configuration Blocks
- Use single backticks for inline code: `variable names`, `UI elements`
- Use triple backticks for multi-line code or configuration:
```
Example configuration text
that users can copy and paste
```

## Coding and Contribution Guidelines

### When Creating New Labs
1. Start with `lab-template.md` as the foundation
2. Follow the established emoji and section conventions
3. Include comprehensive screenshots for UI navigation
4. Test all steps with fresh eyes before publishing
5. Use consistent formatting for UI elements:
   - **Bold** for buttons and clickable elements
   - *Italics* for field names and form inputs
   - `Code blocks` for exact text to enter

### When Modifying Existing Labs
1. Maintain consistency with existing structure and style
2. Update the Table of Contents when adding/removing sections
3. Ensure all image references are valid and accessible
4. Test any modified instructions to ensure accuracy
5. Preserve the learning flow and pedagogical structure

### Image and Asset Management
- Optimize images for web viewing (reasonable file sizes)
- Use consistent screenshot styling and cropping
- Include context in screenshots (show relevant UI chrome)
- Update image references when reorganizing content
- Consider accessibility in image descriptions

### Documentation Best Practices
- Write for the target persona (Maker, Developer, Admin)
- Use active voice and clear, actionable language
- Include realistic time estimates for each section
- Provide context for why steps matter, not just how to do them
- Include troubleshooting for common issues
- End sections with verification steps

### Microsoft Copilot Studio Specific Guidance
- Use official Microsoft terminology consistently
- Reference current UI elements and navigation paths
- Include environment setup and prerequisite information
- Distinguish between different Copilot products (Microsoft 365 Copilot, Copilot Chat, etc.)
- Provide context for business value and use cases
- Include best practices for agent design and deployment

## Technical Considerations

### File Organization
- Keep labs self-contained within their directories
- Use relative paths for internal references
- Maintain clean separation between different lab topics
- Follow consistent naming conventions for directories and files

### Content Maintenance
- Labs should be version-agnostic where possible
- Include guidance for handling UI changes in Microsoft products
- Document any external dependencies or requirements
- Provide alternative approaches when interfaces change

### Quality Assurance
- All labs should be tested end-to-end before publication
- Include expected outcomes and verification steps
- Provide troubleshooting guidance for common issues
- Maintain currency with Microsoft Copilot Studio product updates

This repository serves as both educational content and a reference implementation for creating high-quality, hands-on technical tutorials in the Microsoft AI ecosystem.