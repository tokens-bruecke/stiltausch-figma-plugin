// import { checkForVariables } from "../utils/controller/checkForVariables";

import { config } from "../utils/config";

///

const filterAllowedNodes = (nodes: any[]) => {
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

// clear console on reload
console.clear();
figma.skipInvisibleInstanceChildren = true;

// const figmaRoot = figma.root;

figma.showUI(__html__, {
  width: 300,
  height: 240,
  themeColors: true,
});

// const variableCollections =
// await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();

const init = async () => {
  let teamLibraryCollections = [] as LibraryVariableCollection[];
  let localLibraryCollections = [] as VariableCollection[];
  let allAllowedNodes = [] as (SceneNode | PageNode)[];
  let isSwapForPage = config.isSwapForPage;

  // listen for messages from the UI
  figma.ui.onmessage = async (msg) => {
    if (msg.type === "getCollections") {
      ////////////////////////
      // GET TEAM LIBRARY ////
      ////////////////////////

      if (msg.libraryType === "team") {
        console.clear();

        // get all collections
        teamLibraryCollections =
          await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();

        console.log("teamLibraryCollections", teamLibraryCollections);

        // convert collections to array of objects with all variables
        const filteredCollections = await Promise.all(
          teamLibraryCollections.map(async (collection) => {
            // get all variables in collection
            const collectionVariables =
              await figma.teamLibrary.getVariablesInLibraryCollectionAsync(
                collection.key
              );

            // filter for color variables
            const colorVariables = collectionVariables.filter((variable) => {
              return variable.resolvedType === "COLOR";
            });

            console.log("colorVariables", colorVariables);

            return {
              key: collection.key,
              name: `${collection.libraryName}: ${collection.name}`,
              variables: colorVariables,
            };
          })
        );

        const cleanFromEmptyCollections = filteredCollections.filter(
          (collection) => {
            return collection.variables.length > 0;
          }
        );

        console.log("cleanFromEmptyCollections", cleanFromEmptyCollections);

        figma.ui.postMessage({
          type: "setCollections",
          collections: cleanFromEmptyCollections,
        });
      }

      /////////////////////////
      // GET LOCAL LIBRARY ////
      /////////////////////////

      if (msg.libraryType === "local") {
        console.clear();

        localLibraryCollections = figma.variables.getLocalVariableCollections();
        const colorVariables = figma.variables
          .getLocalVariables()
          .filter((variable) => {
            return variable.resolvedType === "COLOR";
          });

        console.log("localLibraryCollections", localLibraryCollections);
        console.log("colorVariables", colorVariables);

        const filteredCollections = localLibraryCollections.map(
          (collection) => {
            return {
              key: collection.key,
              name: collection.name,
              variables: colorVariables
                .filter((variable) => {
                  return variable.variableCollectionId === collection.id;
                })
                .map((variable) => {
                  return {
                    name: variable.name,
                    key: variable.key,
                    resolvedType: variable.resolvedType,
                  };
                }),
            };
          }
        );

        console.log("filteredCollections", filteredCollections);

        figma.ui.postMessage({
          type: "setCollections",
          collections: filteredCollections,
        });
      }
    }

    if (msg.type === "getStyles") {
      console.log("msg", msg);

      // figma.notify("Loading styles...", {
      //   timeout: 3000,
      // });

      isSwapForPage = msg.isSwapForPage;
      const allNodes = isSwapForPage
        ? figma.currentPage.findAll()
        : figma.root.findAll();

      allAllowedNodes = filterAllowedNodes(allNodes);
      const allUniqueStyleIds = allAllowedNodes
        .map((node: any) => {
          return node.fillStyleId;
        })
        .filter((value, index, self) => {
          return self.indexOf(value) === index;
        });

      if (allUniqueStyleIds.length === 0) {
        figma.notify("No styles found", {
          timeout: 3000,
          error: true,
        });
        return;
      }

      const allUniqueStyles = allUniqueStyleIds.map((styleId) => {
        const style = figma.getStyleById(styleId);
        return {
          id: styleId,
          name: style.name,
        };
      });

      figma.ui.postMessage({
        type: "setStyles",
        styles: allUniqueStyles,
      });
    }

    // change size of UI
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
