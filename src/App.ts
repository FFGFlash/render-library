import createNode from "lib/rendering/createNode";
import { computed, signal } from "lib/signals";

const todos = signal<Todo[]>([
  { completed: false, text: "Learn about signals" },
  { completed: false, text: "Build a todo app" },
  { completed: false, text: "Conquer the world" },
]);

export default function App() {
  const items = computed(() => {
    return todos.value.map((todo, index) => {
      return createNode(Todo, { index, todo });
    });
  });

  return createNode("div", { class: "flex flex-col gap-4" }, items);
}

function Todo({ index, todo }: TodoProps) {
  return createNode("div", { class: "flex items-center gap-2" }, [
    createNode("input", {
      type: "checkbox",
      checked: todo.completed,
      onChange: (e: InputEvent & { target: HTMLInputElement }) => {
        todos.value = todos.value.with(index, {
          ...todo,
          completed: e.target.checked,
        });
      },
    }),
    createNode(
      "span",
      { class: todo.completed ? "line-through" : "" },
      todo.text
    ),
  ]);
}

interface TodoProps {
  index: number;
  todo: Todo;
}

interface Todo {
  completed: boolean;
  text: string;
}
