import { getAllowedNodes } from "../utils/getAllowedNodes";
import { getTeamLibraryCollections } from "../utils/getTeamLibraryCollections";
import { getCleanTeamCollections } from "../utils/getCleanTeamCollections";
import { getCleanLocalCollections } from "../utils/getCleanLocalCollections";
import { getAllUniqueStyles } from "../utils/getAllUniqueStyles";
import { config } from "../utils/config";

console.clear();
figma.skipInvisibleInstanceChildren = true;
figma.showUI(__html__, {
  width: 300,
  height: 240,
  themeColors: true,
});

const init = async () => {
  let teamLibraryCollections = [] as LibraryVariableCollection[];
  let localLibraryCollections = [] as VariableCollection[];
  let allAllowedNodes = [] as (SceneNode | PageNode)[];
  let isSwapForPage = config.isSwapForPage;

  figma.ui.onmessage = async (msg) => {
    if (msg.type === "getCollections") {
      /* TEAM LIBRARY TYPE */
      if (msg.libraryType === "team") {
        teamLibraryCollections = await getTeamLibraryCollections();
        const cleanFromEmptyCollections = await getCleanTeamCollections(
          teamLibraryCollections
        );
        figma.ui.postMessage({
          type: "setCollections",
          collections: cleanFromEmptyCollections,
        });
      }

      /* LOCAL LIBRARY TYPE */
      if (msg.libraryType === "local") {
        localLibraryCollections = figma.variables.getLocalVariableCollections();
        const filteredCollections = getCleanLocalCollections(
          localLibraryCollections
        );
        const cleanFromEmptyCollections = filteredCollections.filter(
          (collection) => collection.variables.length > 0
        );
        figma.ui.postMessage({
          type: "setCollections",
          collections: cleanFromEmptyCollections,
        });
      }
    }

    if (msg.type === "getStyles") {
      isSwapForPage = msg.isSwapForPage;
      const allNodes = isSwapForPage
        ? figma.currentPage.findAll()
        : figma.root.findAll();

      allAllowedNodes = getAllowedNodes(allNodes);
      const allUniqueStyles = await getAllUniqueStyles(allAllowedNodes);

      if (allUniqueStyles.length === 0) {
        figma.notify("No styles found", {
          timeout: 3000,
          error: true,
        });
        return;
      }

      figma.ui.postMessage({
        type: "setStyles",
        styles: allUniqueStyles,
      });
    }

    if (msg.type === "swapAll") {
      const { libraryType, isSwapForPage, collectionKey } = msg;
      const allNodes = isSwapForPage
        ? figma.currentPage.findAll()
        : figma.root.findAll();

      allAllowedNodes = getAllowedNodes(allNodes);

      if (allAllowedNodes.length === 0) {
        figma.notify("No styles found", {
          timeout: 3000,
          error: true,
        });
        return;
      }

      const collection =
        libraryType === "team"
          ? teamLibraryCollections.find(
              (collection) => collection.key === collectionKey
            )
          : localLibraryCollections.find(
              (collection) => collection.key === collectionKey
            );
      console.log(collection);
    }

    if (msg.type === "resizeUIHeight") {
      figma.ui.resize(config.frameWidth, msg.height);
    }
  };

  figma.on("currentpagechange", () => {
    if (isSwapForPage) {
      figma.ui.postMessage({
        type: "resetStyles",
      });
    }
  });
};

init();
