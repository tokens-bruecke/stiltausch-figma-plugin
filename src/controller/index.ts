import { getAllowedNodes } from "../utils/getAllowedNodes";
import { getTeamLibraryCollections } from "../utils/getTeamLibraryCollections";
import { getCleanTeamCollections } from "../utils/getCleanTeamCollections";
import { getAllUniqueStyles } from "../utils/getAllUniqueStyles";
import { config } from "../utils/config";

console.clear();
figma.skipInvisibleInstanceChildren = true;
figma.showUI(__html__, {
  width: config.frameWidth,
  height: 240,
  themeColors: true,
});

const init = async () => {
  let cleanTeamCollections = [] as {
    key: string;
    name: string;
    variables: LibraryVariable[];
  }[];
  let isSwapForPage = config.isSwapForPage;

  figma.ui.onmessage = async (msg) => {
    if (msg.type === "getCollections") {
      const teamLibraryCollections = await getTeamLibraryCollections();
      cleanTeamCollections = await getCleanTeamCollections(
        teamLibraryCollections
      );

      figma.ui.postMessage({
        type: "setCollections",
        collections: cleanTeamCollections,
      });
    }

    if (msg.type === "getStyles") {
      isSwapForPage = msg.isSwapForPage;
      const allNodes = isSwapForPage
        ? figma.currentPage.findAll()
        : figma.root.findAll();

      const allAllowedNodes = getAllowedNodes(allNodes);
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
      console.log("cleanTeamCollections", cleanTeamCollections);
      const allNodes = isSwapForPage
        ? figma.currentPage.findAll()
        : figma.root.findAll();

      const allAllowedNodes = getAllowedNodes(allNodes);

      for (const node of allAllowedNodes) {
        const styleId = node.fillStyleId;

        if (typeof styleId !== "string") {
          // Instead of a return statement, continue to the next iteration
          continue;
        }

        const style = figma.getStyleById(styleId);
        const styleName = style?.name;

        console.log("styleName", styleName);

        // // TODO: check if we can delete this
        // if (styleName === undefined) {
        //   // Instead of a return statement, continue to the next iteration
        //   continue;
        // }
      }
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
