import { getAllowedNodes } from "../utils/getAllowedNodes";
import { getTeamLibraryCollections } from "../utils/getTeamLibraryCollections";
import { getCleanTeamCollections } from "../utils/getCleanTeamCollections";
import { getAllUniqueStyles } from "../utils/getAllUniqueStyles";
import { showMsg } from "../utils/showMsg";
import { config } from "../utils/config";

console.clear();
figma.skipInvisibleInstanceChildren = true;
figma.showUI(__html__, {
  width: config.frameWidth,
  height: 260,
  themeColors: true,
});

const init = async () => {
  let cleanTeamCollections = [] as {
    key: string;
    name: string;
    variables: LibraryVariable[];
  }[];
  let allAllowedNodes = [] as any[];
  let swappedStylesCount = 0;
  let isSwapPageOnly = false;

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
      const { isSwapForPage } = msg;

      isSwapPageOnly = isSwapForPage;
      const allNodes = isSwapPageOnly
        ? figma.currentPage.findAll()
        : figma.root.findAll();

      console.log("allNodes amount", allNodes.length);

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

    /* --------------------- */
    /* -- Swap all styles -- */
    /* --------------------- */

    if (msg.type === "swapAll") {
      swappedStylesCount = 0;

      const { isSwapForPage, collectionKey } = msg;

      isSwapPageOnly = isSwapForPage;
      const allNodes = isSwapPageOnly
        ? figma.currentPage.findAll()
        : figma.root.findAll();

      const allAllowedNodes = getAllowedNodes(allNodes);
      const selectedCollection = cleanTeamCollections.find(
        (collection) => collection.key === collectionKey
      );

      if (!selectedCollection) {
        console.error("Selected collection not found.");
        return;
      }

      const selectedCollectionVariables = selectedCollection.variables;

      for (const node of allAllowedNodes) {
        const styleId = node.fillStyleId;

        if (typeof styleId !== "string" || !styleId) {
          continue;
        }

        const style = figma.getStyleById(styleId);

        if (!style) {
          console.error(`Style with ID ${styleId} not found.`);
          continue;
        }

        const styleName = style.name;

        const matchingVariable = selectedCollectionVariables.find(
          (variable) => variable.name === styleName
        );

        // console.log("matchingVariable", matchingVariable.name);

        // console.log("matchingVariable", matchingVariable.name);
        // console.log("node type", node.type);

        if (!matchingVariable) {
          continue;
        }

        const importedVariable = await figma.variables.importVariableByKeyAsync(
          matchingVariable.key
        );

        const fillsCopy = JSON.parse(JSON.stringify(node.fills));

        fillsCopy[0] = figma.variables.setBoundVariableForPaint(
          fillsCopy[0],
          "color",
          importedVariable
        );

        swappedStylesCount++;

        node.fills = await fillsCopy;
      }

      figma.ui.postMessage({
        type: "finishSwap",
      });

      if (swappedStylesCount === 0) {
        figma.notify("No styles to swap 🤔", {
          timeout: 3000,
        });
        return;
      }

      figma.notify(`Swapped ${swappedStylesCount} styles! 🎉`, {
        timeout: 3000,
      });
    }

    /* ------------------- */
    /* -- Swap manually -- */
    /* ------------------- */

    if (msg.type === "swapManually") {
      swappedStylesCount = 0;

      const { isSwapForPage, variableKey, styleId } = msg;

      console.log("msg", msg);

      isSwapPageOnly = isSwapForPage;

      const allMatchingNodes = allAllowedNodes.filter((node) => {
        const nodeStyleId = node.fillStyleId;

        if (typeof nodeStyleId !== "string" || !nodeStyleId) {
          return false;
        }

        return nodeStyleId === styleId;
      });

      console.log("allMatchingNodes amount", allMatchingNodes.length);

      if (allMatchingNodes.length === 0) {
        showMsg.info("No matching styles in the file 🤷‍♂️");
        figma.ui.postMessage({
          type: "finishSwap",
        });
        return;
      }

      // console.log("variableKey", variableKey);

      const swapVariable = await figma.variables.importVariableByKeyAsync(
        variableKey
      );

      console.log("swapVariable", swapVariable);

      allMatchingNodes.forEach(async (node: any) => {
        const fillsCopy = JSON.parse(JSON.stringify(node.fills));

        fillsCopy[0] = figma.variables.setBoundVariableForPaint(
          fillsCopy[0],
          "color",
          swapVariable
        );

        swappedStylesCount++;

        node.fills = await fillsCopy;
      });

      figma.ui.postMessage({
        type: "finishSwap",
      });

      // NOTE:
      // no need to add a check swappedStylesCount === 0
      // because we already checked if there are matching styles

      figma.notify(`Swapped ${swappedStylesCount} styles! 🎉`, {
        timeout: 3000,
      });
    }

    /* ---------------------- */
    /* -- Resize UI height -- */
    /* ---------------------- */

    if (msg.type === "resizeUIHeight") {
      figma.ui.resize(config.frameWidth, msg.height);
    }
  };

  // reset styles when page changes and
  // styles valid only for a page
  figma.on("currentpagechange", () => {
    if (isSwapPageOnly) {
      figma.ui.postMessage({
        type: "resetStyles",
      });
    }
  });
};

init();
