import Menu from "@/models/Menu";

/** Assign consecutive displayOrder values 1..n based on current sort. */
export async function resequenceMenuOrders() {
  const items = await Menu.find().sort({ displayOrder: 1, name: 1 });
  await Promise.all(
    items.map((item, index) => {
      const next = index + 1;
      if (item.displayOrder === next) return Promise.resolve();
      item.displayOrder = next;
      return item.save();
    })
  );
  return items.length;
}

export async function getNextDisplayOrder() {
  const last = await Menu.findOne().sort({ displayOrder: -1 }).select("displayOrder");
  return (last?.displayOrder ?? 0) + 1;
}
