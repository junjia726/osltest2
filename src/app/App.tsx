import { RouterProvider } from "react-router";
import { router } from "./routes";
import { UserProvider } from "./components/UserContext";
import { RealtimeProvider } from "./components/RealtimeContext";

export default function App() {
  return (
    <RealtimeProvider>
      <UserProvider>
        <RouterProvider router={router} />
      </UserProvider>
    </RealtimeProvider>
  );
}