import React from "react";

import { config } from "../../utils/config";

import { Text, Button, Stack } from "pavelLaptev/react-figma-ui/ui";
import { StatusPicture } from "../StatusPicture";

import styles from "./styles.module.scss";

interface NoLibrariesContainerProps {
  label: string;
}

export const NoLibrariesContainer = ({ label }: NoLibrariesContainerProps) => {
  return (
    <section className={styles.emptyView}>
      <Stack gap={8} className={styles.group}>
        <StatusPicture status="error" />
        <Text className={styles.label}>{label}</Text>
      </Stack>

      <Stack gap={8} className={styles.group}>
        <Button
          className={styles.button}
          label="Learn more about Libraries"
          onClick={() => {
            window.open(config.docsLink, "_blank");
          }}
          fullWidth
        />
      </Stack>
    </section>
  );
};
