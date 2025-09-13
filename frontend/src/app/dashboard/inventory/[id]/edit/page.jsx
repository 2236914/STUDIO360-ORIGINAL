import { InventoryEditView } from 'src/sections/inventory/view';

// ----------------------------------------------------------------------

export default function InventoryEditPage({ params }) {
  const { id } = params;

  return <InventoryEditView id={id} />;
}
