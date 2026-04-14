/* ============================= */
/* c01ai BLOG ENGINE (v2) */
/* ============================= */

import { Home } from "./pages/Home.js"
import { BlogView } from "./pages/BlogView.js"
import { Admin } from "./pages/Admin.js"


/* ============================= */
/* ROOT ELEMENTS */
/* ============================= */

const app = document.getElementById("app")
const loader = document.getElementById("loader")

/* ============================= */
/* LOADER */
/* ============================= */

export function showLoader() {
  if (loader) loader.classList.remove("hidden")
}

export function hideLoader() {
  if (loader) loader.classList.add("hidden")
}

/* ============================= */
/* ROUTES */
/* ============================= */

const routes = {
  "/": Home,
  "/blog": BlogView,
  "/admin": Admin
}

/* ============================= */
/* NAVIGATION */
/* ============================= */

window.navigate = function (path) {
  if (!path) return

  history.pushState({}, "", path)
  renderRoute()
}

/* ============================= */
/* GET CURRENT PATH */
/* ============================= */

function getPath() {
  return window.location.pathname
}

/* ============================= */
/* ROUTE HANDLER */
/* ============================= */

function getRouteComponent(path) {

  // direct match
  if (routes[path]) return routes[path]

  // dynamic blog route
  if (path.startsWith("/blog")) {
    return BlogView
  }

  return null
}

/* ============================= */
/* RENDER ROUTE */
/* ============================= */

async function renderRoute() {

  showLoader()

  const path = getPath()
  const Page = getRouteComponent(path)

  // scroll to top on navigation
  window.scrollTo(0, 0)

  if (!Page) {
    render404()
    hideLoader()
    return
  }

  try {

    const content = await Page()

    // safe render
    app.innerHTML = content

  } catch (err) {

    console.error("ROUTE ERROR:", err)
    renderError()

  }

  hideLoader()
}

/* ============================= */
/* ERROR UI */
/* ============================= */

function render404() {
  app.innerHTML = `
    <div class="center-page">
      <h1>404</h1>
      <p>Page not found</p>
      <button onclick="navigate('/')">Go Home</button>
    </div>
  `
}

function renderError() {
  app.innerHTML = `
    <div class="center-page">
      <h1>⚠️ Error</h1>
      <p>Something went wrong</p>
      <button onclick="navigate('/')">Reload</button>
    </div>
  `
}

/* ============================= */
/* BACK / FORWARD */
/* ============================= */

window.addEventListener("popstate", renderRoute)

/* ============================= */
/* INIT */
/* ============================= */

renderRoute()