interface ToastIPropsI {
  title: string;
  message: string;
  options: {
    type?: "success" | "error" | "info";
    timeout?: number;
    onClose?: () => void;
  };
}
