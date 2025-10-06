import { PublicPage } from "./pages/public.js";
import { AdminPage } from "./pages/admin.js";
import { Header } from "./components/header.js";
import { Footer } from "./components/footer.js";

export function Router() {
  const app = document.getElementById("app");
  const hash = window.location.hash || "#/";

  let content = "";

  if (hash === "#/admin") {
    content = AdminPage();
  } else {
    content = PublicPage();
  }

  app.innerHTML = `
    ${Header()}
    <main class="content">${content}</main>
    ${Footer()}
  `;
}
