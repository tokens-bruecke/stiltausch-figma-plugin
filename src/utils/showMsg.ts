export const showMsg = {
  info: (successMessage: string) => {
    figma.notify(successMessage, {
      timeout: 3000,
    });
    console.log(successMessage);
  },
  error: (errorMessage: string) => {
    figma.notify(errorMessage, {
      timeout: 3000,
      error: true,
    });
    console.error(errorMessage);
  },
};
