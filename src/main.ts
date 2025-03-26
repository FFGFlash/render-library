import "./style.css";
import createNode from "lib/rendering/createNode";
import render from "lib/rendering/render";
import App from "./App";

const root = document.getElementById("app");
if (!root) throw new Error("Root element not found");
render(root, createNode(App, {}));
