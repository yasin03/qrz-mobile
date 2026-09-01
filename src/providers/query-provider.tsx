import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

type Props = {
  children: ReactNode;
};

export function QueryProvider({ children }: Props) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 4xx hatalarında retry yapma — 401 loop'u önler
            retry: (failureCount, error: unknown) => {
              if (
                error != null &&
                typeof error === "object" &&
                "status" in error &&
                typeof (error as { status: unknown }).status === "number" &&
                (error as { status: number }).status >= 400
              ) {
                return false;
              }
              return failureCount < 2;
            },
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
