import { Router, Route, Switch } from "wouter";
import Home from "./pages/home";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/home" component={Home} />
            <Route>
              <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">
                    Página No Encontrada
                  </h2>
                  <p className="text-gray-600 mb-8">
                    Lo sentimos, la página que estás buscando no existe.
                  </p>
                  <a
                    href="/"
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Volver al Inicio
                  </a>
                </div>
              </div>
            </Route>
          </Switch>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}