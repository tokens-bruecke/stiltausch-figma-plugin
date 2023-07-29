import { getVariablesInLibraryCollection } from "./getVariablesInLibraryCollection";

export async function getCleanTeamCollections(
  collections: LibraryVariableCollection[]
) {
  const filteredCollections = await Promise.all(
    collections.map(async (collection) => {
      const collectionVariables = await getVariablesInLibraryCollection(
        collection
      );
      const colorVariables = collectionVariables.filter(
        (variable) => variable.resolvedType === "COLOR"
      );

      return {
        key: collection.key,
        name: `${collection.libraryName}: ${collection.name}`,
        variables: colorVariables,
      };
    })
  );

  return filteredCollections.filter(
    (collection) => collection.variables.length > 0
  );
}
