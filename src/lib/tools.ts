export type ToolDefinition = {
  slug: string;
  titleKey: string;
  descriptionKey: string;
  active: boolean;
  icon: "combine" | "split" | "archive" | "image" | "file-image" | "rotate";
};

export const TOOLS: ToolDefinition[] = [
  { slug: "compress-pdf", titleKey: "compressTitle", descriptionKey: "compressDescription", active: true, icon: "archive" },
  { slug: "merge-pdf", titleKey: "mergeTitle", descriptionKey: "mergeDescription", active: true, icon: "combine" },
  { slug: "workflow-builder", titleKey: "workflowTitle", descriptionKey: "workflowDescription", active: true, icon: "combine" },
  { slug: "split-pdf", titleKey: "splitTitle", descriptionKey: "splitDescription", active: false, icon: "split" },
  { slug: "jpg-to-pdf", titleKey: "jpgToPdfTitle", descriptionKey: "jpgToPdfDescription", active: false, icon: "image" },
  { slug: "pdf-to-jpg", titleKey: "pdfToJpgTitle", descriptionKey: "pdfToJpgDescription", active: false, icon: "file-image" },
  { slug: "rotate-pdf", titleKey: "rotateTitle", descriptionKey: "rotateDescription", active: false, icon: "rotate" }
];

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return TOOLS.find((tool) => tool.slug === slug);
}

export function getComingSoonTools(): ToolDefinition[] {
  return TOOLS.filter((tool) => !tool.active);
}

export function getDirectoryTools(): ToolDefinition[] {
  return TOOLS.filter((tool) => tool.slug !== "workflow-builder");
}
