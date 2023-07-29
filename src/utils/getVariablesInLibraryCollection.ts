export async function getVariablesInLibraryCollection(collection) {
  return await figma.teamLibrary.getVariablesInLibraryCollectionAsync(
    collection.key
  );
}
