export function applyHook(hook, item) {
  try {
    if (typeof item === "function") {
      item(hook);
    } else if (typeof item === "string") {
    } else if (item.apply && typeof item.apply === "function") {
      item["apply"](hook);
    } else {
      throw new Error("插件格式错误!!");
    }
  } catch (err) {
    console.error(err);
    return;
  }
}
