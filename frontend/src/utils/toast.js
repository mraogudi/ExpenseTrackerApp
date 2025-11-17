import { createStandaloneToast } from "@chakra-ui/react";

const { toast: chakraToast } = createStandaloneToast();

export const toast = {
  success: (description) =>
    chakraToast({
      title: "Success",
      description,
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top-right",
    }),

  error: (description) =>
    chakraToast({
      title: "Error",
      description,
      status: "error",
      duration: 3000,
      isClosable: true,
      position: "top-right",
    }),

    error: (description) =>
    chakraToast({
      title: "Error",
      description,
      status: "error",
      duration: 3000,
      isClosable: true,
      position: "top-right",
    }),

    info: (description) => {
      chakraToast({
        title: "Info",
        description,
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      })
    }
};
