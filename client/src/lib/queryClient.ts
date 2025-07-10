import { QueryClient } from '@tanstack/react-query'

// One global instance per browser tab
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})
