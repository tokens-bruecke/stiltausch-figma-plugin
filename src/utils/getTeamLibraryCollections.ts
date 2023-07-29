export async function getTeamLibraryCollections() {
  return await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
}
