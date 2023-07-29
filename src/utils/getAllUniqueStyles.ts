export async function getAllUniqueStyles(nodes) {
  const styleCounts = new Map(); // Use a Map to keep track of style counts

  // Count occurrences of each styleId
  nodes.forEach((node) => {
    const styleId = node.fillStyleId;
    if (styleId && typeof styleId === "string") {
      styleCounts.set(styleId, (styleCounts.get(styleId) || 0) + 1);
    }
  });

  // Fetch and construct unique styles with counts in their names
  const allUniqueStyles = await Promise.all(
    Array.from(styleCounts).map(async ([styleId, count]) => {
      const style = figma.getStyleById(styleId);
      return {
        id: styleId,
        name: `${style.name} (${count})`,
      };
    })
  );

  return allUniqueStyles;
}
