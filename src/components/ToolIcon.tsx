import {
  Archive,
  ArrowsClockwise,
  FileImage,
  Files,
  Image,
  Scissors
} from "@phosphor-icons/react/dist/ssr";
import type { ToolDefinition } from "@/lib/tools";

export function ToolIcon({ icon }: { icon: ToolDefinition["icon"] }) {
  const props = { size: 24, weight: "duotone" as const };

  if (icon === "combine") return <Files {...props} />;
  if (icon === "split") return <Scissors {...props} />;
  if (icon === "archive") return <Archive {...props} />;
  if (icon === "image") return <Image {...props} />;
  if (icon === "file-image") return <FileImage {...props} />;
  return <ArrowsClockwise {...props} />;
}
