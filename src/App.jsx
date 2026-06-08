import MainPage from "./MainPage";
import DexApp from "./DexApp";

export default function App() {
  const path = window.location.pathname;

  if (path === "/" || path === "" || path === "/main" || path === "/home") {
    return <MainPage />;
  }

  return <DexApp />;
}
