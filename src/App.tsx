import { GitHubBanner, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import routerProvider, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { BrowserRouter, Route, Routes } from "react-router";
import "./App.css";
import { Toaster } from "./components/refine-ui/notification/toaster";
import { useNotificationProvider } from "./components/refine-ui/notification/use-notification-provider";
import { ThemeProvider } from "./components/refine-ui/theme/theme-provider";
import { dataProvider } from "./providers/data.ts";
import Dashboard from "./pages/Dashboard";
import { BookOpen, GraduationCap, Home } from "lucide-react";
import { Layout } from "@/components/refine-ui/layout/layout.tsx";
import { Outlet } from "react-router";
import SubjectsList from "./pages/subjects/List";
import SubjectsCreate from "./pages/subjects/Create";
import ClassesList from "./pages/classes/list";
import ClassesCreate from "./pages/classes/create";

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ThemeProvider>
          <DevtoolsProvider>
            <Refine
              dataProvider={dataProvider}
              notificationProvider={useNotificationProvider()}
              routerProvider={routerProvider}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                projectId: "fDBVkC-aLarQT-Fn1Y6r",
              }}
              resources={[
                {
                  name: 'dashboard', 
                  list: '/', 
                  meta: { label: 'Home', icon: <Home /> }
                },
                {
                  name: 'subjects',
                  list: '/subjects',
                  meta: { label: 'Subjects', icon: <BookOpen /> }
                },
                {
                  name: 'classes',
                  list: '/classes',
                  meta: { label: 'Classes', icon: <GraduationCap /> }
                } 
              ]}
            >
              <Routes>
                <Route element={
                  <Layout>
                    <Outlet />
                  </Layout>
                }>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/subjects">
                    <Route index element={<SubjectsList />} />
                    <Route path="create" element={<SubjectsCreate />} />
                  </Route>

                  <Route path="/classes">
                    <Route index element={<ClassesList />} />
                    <Route path="create" element={<ClassesCreate />} />
                  </Route>
                </Route>
              </Routes>
              <Toaster />
              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
            <DevtoolsPanel />
          </DevtoolsProvider>
        </ThemeProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
