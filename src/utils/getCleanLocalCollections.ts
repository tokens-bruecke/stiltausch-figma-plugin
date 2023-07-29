export function getCleanLocalCollections(collections) {
  const colorVariables = figma.variables
    .getLocalVariables()
    .filter((variable) => variable.resolvedType === "COLOR");

  return collections.map((collection) => {
    return {
      key: collection.key,
      name: collection.name,
      variables: colorVariables
        .filter((variable) => variable.variableCollectionId === collection.id)
        .map((variable) => {
          return {
            name: variable.name,
            key: variable.key,
            resolvedType: variable.resolvedType,
          };
        }),
    };
  });
}
