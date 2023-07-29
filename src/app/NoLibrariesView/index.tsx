import React from "react";

import { config } from "../../utils/config";

import { Text, Button, Stack } from "pavelLaptev/react-figma-ui/ui";
import { StatusPicture } from "../../components/StatusPicture";

import styles from "./styles.module.scss";

interface NoLibrariesViewrProps {
  label: string;
}

export const NoLibrariesView = ({ label }: NoLibrariesViewrProps) => {
  return (
    <section className={styles.emptyView}>
      <Stack gap={8} className={styles.group}>
        <StatusPicture status="error" />
        <Text className={styles.label}>{label}</Text>
      </Stack>
      <Button
        className={styles.button}
        label="What is a team library?"
        onClick={() => {
          window.open(config.docsLink, "_blank");
        }}
      />
    </section>
  );
};
