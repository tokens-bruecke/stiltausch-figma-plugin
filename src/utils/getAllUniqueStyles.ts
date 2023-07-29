export async function getAllUniqueStyles(nodes) {
  const allUniqueStyleIds = nodes
    .map((node: any) => {
      return node.fillStyleId;
    })
    .filter((value, index, self) => {
      return self.indexOf(value) === index;
    });

  const allUniqueStyles = await Promise.all(
    allUniqueStyleIds.map(async (styleId) => {
      const style = figma.getStyleById(styleId);
      return {
        id: styleId,
        name: style.name,
      };
    })
  );

  return allUniqueStyles;
}
