import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RfpListPage from "./pages/RfpListPage";
import RfpCreatePage from "./pages/RfpCreatePage";
import RfpDetailPage from "./pages/RfpDetailPage";
import VendorListPage from "./pages/VendorListPage";
import Layout from "./components/Layout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/rfps" replace />} />
          <Route path="/rfps" element={<RfpListPage />} />
          <Route path="/rfps/new" element={<RfpCreatePage />} />
          <Route path="/rfps/:id" element={<RfpDetailPage />} />
          <Route path="/vendors" element={<VendorListPage />} />
          <Route path="*" element={<Navigate to="/rfps" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
