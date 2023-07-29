export const getAllowedNodes = (nodes: any[]) => {
  const filtered = nodes.filter((node: any) => {
    if (
      !node.fillStyleId ||
      typeof node.fillStyleId !== "string" ||
      node.type === "INSTANCE"
    ) {
      return false;
    }

    return true;
  });

  return filtered;
};
