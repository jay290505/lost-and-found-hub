import { AddItemForm } from "./add-item-form";

export default function AddItemPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Report an Item
        </h1>
        <p className="text-muted-foreground">
          Fill out the details below to post a lost or found item.
        </p>
      </div>
      <AddItemForm />
    </div>
  );
}
