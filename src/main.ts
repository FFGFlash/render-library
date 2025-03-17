import { computed, effect, signal } from "lib/signal";
import "./style.css";
import { createNode, render } from "lib/node";

// function Todo({ id, title }: TodoProp) {
//   return createNode("div", { className: "relative" }, [
//     createNode(
//       "h1",
//       {
//         className:
//           "absolute bottom-0 left-0 right-0 text-4xl font-bold bg-black/50 text-white p-2 flex items-center justify-center",
//       },
//       title
//     ),
//     createNode("img", {
//       src: `https://picsum.photos/id/${id}/800/600`,
//       style: {
//         width: "800px",
//         height: "600px",
//       },
//     }),
//   ]);
// }

// interface TodoProp {
//   id: number;
//   userId: number;
//   title: string;
//   completed: boolean;
// }

// function TodoList() {
//   const todos = computed(async (signal) => {
//     const response = await fetch("https://jsonplaceholder.typicode.com/todos", {
//       signal,
//     });
//     const data = await response.json();
//     return data as TodoProp[];
//   });

//   const todoElements = computed(() => {
//     return todos.value?.map((todo) => createNode(Todo, todo));
//   });

//   return createNode(
//     "div",
//     {
//       className: "flex flex-col gap-10 p-10 items-center",
//     },
//     todoElements
//   );
// }

function Odd() {
  const test = signal(0);

  effect(() => {
    console.log("test", test.value);
  });

  effect(() => {
    const interval = setInterval(() => {
      test.value++;
    }, 1000);
    return () => clearInterval(interval);
  });

  return createNode("h2", null, ["Odd for ", test]);
}

function Even() {
  return createNode("h2", null, "Even");
}

function Main() {
  const count = signal(0);

  effect(() => {
    console.log("test");
  });

  return createNode(
    "div",
    { className: "flex flex-col gap-10 p-10 items-center text-white" },
    [
      createNode("h1", { className: "text-4xl font-bold" }, "Counter"),
      createNode("div", { className: "flex gap-5" }, [
        createNode("button", { onClick: () => count.value-- }, "-"),
        createNode("span", null, count),
        createNode("button", { onClick: () => count.value++ }, "+"),
      ]),
      computed(() => {
        return count.value % 2 === 0 ? createNode(Even) : createNode(Odd);
      }),
    ]
  );
}

const rootEl = document.getElementById("app");
if (!rootEl) throw new Error("Root element not found");
render(rootEl, createNode(Main));

