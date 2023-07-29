import React, { useState, useEffect } from "react";

import { useDidUpdate } from "../utils/hooks/useDidUpdate";

import { Toast } from "../components/Toast";
import { LoadingView } from "./LoadingView";
import { NoLibrariesView } from "./NoLibrariesView";
import {
  Stack,
  Tabs,
  Icon,
  Panel,
  Input,
  PanelHeader,
  Text,
  Button,
  ToggleRow,
  NativeDropdown,
} from "pavelLaptev/react-figma-ui/ui";
import styles from "./styles.module.scss";
import { config } from "../utils/config";

const Container = () => {
  // const toastRef = React.useRef(null);
  const wrapperRef = React.useRef(null);

  const [isLoading, setIsLoading] = useState(true);

  const [isSwapManually, setIsSwapManually] = useState(false);
  const [isSwapForPage, setIsSwapForPage] = useState(config.isSwapForPage);

  const [collections, setCollections] = useState(
    [] as {
      key: string;
      name: string;
      variables: LibraryVariable[];
    }[]
  );
  const [avaliableStyles, setAvaliableStyles] = useState(
    [] as {
      id: string;
      name: string;
    }[]
  );

  const [selectedCollection, setSelectedCollection] = useState(
    null as {
      key: string;
      name: string;
      variables: LibraryVariable[];
    }
  );
  const [selectedStyle, setSelectedStyle] = useState("");
  const [selectedVariable, setSelectedVariable] = useState(
    null as {
      key: string;
      name: string;
    } | null
  );

  /* ----------------------- */
  /* --- EVENT HANDLERS ---- */
  /* ----------------------- */

  const handleSwapAllChange = (value) => {
    // console.log(value);
    setIsSwapManually(value);
  };

  const handleSwapFileChange = (value) => {
    // console.log(value);
    setIsSwapForPage(value);
  };

  const handleCollectionChange = (value) => {
    // console.log(value);
    const collection = collections.find((collection) => {
      return collection.key === value;
    });

    setSelectedCollection(collection);
  };

  const handleVariableChange = (value) => {
    // console.log(value);
    setSelectedVariable(value);
  };

  const handleStyleChange = (value) => {
    // console.log(value);
    setSelectedStyle(value);
  };

  const handleSwap = () => {
    if (isSwapManually) {
      parent.postMessage(
        {
          pluginMessage: {
            type: "swapManually",
            isSwapForPage,
            collectionKey: selectedCollection.key,
            variableKey: selectedVariable.key,
            styleId: selectedStyle,
          },
        },
        "*"
      );
    } else {
      parent.postMessage(
        {
          pluginMessage: {
            type: "swapAll",
            isSwapForPage,
            collectionKey: selectedCollection.key,
          },
        },
        "*"
      );
    }
  };

  /* ----------------------- */
  /* --- USE EFFECTS ------- */
  /* ----------------------- */

  useDidUpdate(() => {
    // if selected collection is changed
    // also reset selected variable
    setSelectedVariable(
      {
        key: selectedCollection.variables[0].key,
        name: selectedCollection.variables[0].name,
      } || null
    );
  }, [selectedCollection]);

  useDidUpdate(() => {
    // reset avaliable styles if isSwapForPage is changed
    setAvaliableStyles([]);
  }, [isSwapForPage]);

  useEffect(() => {
    window.onmessage = (event) => {
      const msg = event.data.pluginMessage;

      if (msg.type === "setCollections") {
        console.log("setCollections", msg.collections);

        if (msg.collections.length === 0) {
          setIsLoading(false);
          return;
        }

        setCollections(msg.collections);
        setSelectedCollection(msg.collections[0]);
        setSelectedVariable({
          key: msg.collections[0].variables[0].key,
          name: msg.collections[0].variables[0].name,
        });

        setIsLoading(false);
      }

      if (msg.type === "setStyles") {
        console.log("setStyles", msg.styles);

        // if (msg.styles.length === 0) {
        //   toastRef.current.show({
        //     title: "No styles found",
        //     message: `No styles found in ${isSwapForPage ? "page" : "file"}`,
        //     options: {
        //       type: "error",
        //       timeout: 3000,
        //     },
        //   });
        // }

        setAvaliableStyles(msg.styles);
      }

      if (msg.type === "resetStyles") {
        console.log("resetStyles", msg.styles);

        setAvaliableStyles([]);
      }
    };
  }, []);

  useEffect(() => {
    parent.postMessage(
      {
        pluginMessage: {
          type: "getCollections",
        },
      },
      "*"
    );

    setIsLoading(true);
  }, []);

  // RESIZE VIEW
  // Check if the view was changed
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      const { height } = entries[0].contentRect;

      parent.postMessage(
        {
          pluginMessage: {
            type: "resizeUIHeight",
            height,
          },
        },
        "*"
      );
    });

    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  /* ----------------------- */
  /* --- RENDER VIEW ------- */
  /* ----------------------- */

  const renderStylesSection = () => {
    if (avaliableStyles.length === 0) {
      return (
        <Stack hasTopBottomPadding hasLeftRightPadding>
          <Button
            label={`Get all styles from ${isSwapForPage ? "page" : "file"}`}
            secondary
            onClick={() => {
              parent.postMessage(
                {
                  pluginMessage: {
                    type: "getStyles",
                    isSwapForPage,
                  },
                },
                "*"
              );
            }}
            fullWidth
          />
        </Stack>
      );
    }

    return (
      <Stack hasTopBottomPadding hasLeftRightPadding={false} hasRightPadding>
        <NativeDropdown
          label="Style to swap"
          value={selectedStyle}
          options={avaliableStyles.map((style) => {
            return {
              label: style.name,
              id: style.id,
            };
          })}
          onChange={handleStyleChange}
        />
      </Stack>
    );
  };

  /////////////////////

  const renderView = () => {
    const isSwapCTAEnabled = isSwapManually && avaliableStyles.length === 0;

    if (isLoading) {
      return <LoadingView />;
    }

    // if (!fileHasVariables) {
    //   return <EmptyView setFileHasVariables={setFileHasVariables} />;
    // }

    return (
      <Stack hasLeftRightPadding={false}>
        {collections.length === 0 && (
          <Panel>
            <NoLibrariesView label={"No team libraries found"} />
          </Panel>
        )}

        {collections.length > 0 && (
          <>
            <Panel hasLeftPadding>
              <ToggleRow
                id="swap-file"
                label="Run for the current page"
                checked={isSwapForPage}
                onChange={handleSwapFileChange}
              />
              <Stack hasBottomPadding>
                <Text className={styles.toggleRowDescription}>
                  Recommended for heavy files.
                </Text>
              </Stack>
            </Panel>

            <Panel hasLeftPadding>
              <ToggleRow
                id="swap-manually"
                label="Swap manually"
                checked={isSwapManually}
                onChange={handleSwapAllChange}
              />
              <Stack hasBottomPadding>
                <Text className={styles.toggleRowDescription}>
                  If your variable and style names are different.
                </Text>
              </Stack>
            </Panel>

            <Panel hasLeftRightPadding>
              <Stack
                hasTopBottomPadding
                hasRightPadding
                hasLeftRightPadding={false}
                gap={8}
              >
                <NativeDropdown
                  label="Collection"
                  value={selectedCollection.key}
                  options={collections.map((collection) => {
                    return {
                      label: collection.name,
                      id: collection.key,
                    };
                  })}
                  onChange={handleCollectionChange}
                />

                {isSwapManually && (
                  <>
                    <NativeDropdown
                      label="Variable"
                      value={selectedVariable.key}
                      options={selectedCollection.variables.map((variable) => {
                        return {
                          label: variable.name,
                          id: variable.key,
                        };
                      })}
                      onChange={handleVariableChange}
                    />
                  </>
                )}
              </Stack>
            </Panel>

            {isSwapManually && (
              <Panel hasLeftRightPadding>{renderStylesSection()}</Panel>
            )}

            <Panel hasLeftRightPadding>
              <Stack hasTopBottomPadding>
                <Button
                  disabled={isSwapCTAEnabled}
                  label="Swap"
                  onClick={handleSwap}
                  fullWidth
                />
              </Stack>
            </Panel>
          </>
        )}
      </Stack>
    );
  };

  return (
    <div ref={wrapperRef} className={styles.container}>
      {/* <Toast ref={toastRef} /> */}
      {renderView()}
    </div>
  );
};

export default Container;
