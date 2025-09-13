import { InventoryDetailsView } from 'src/sections/inventory/view';

// ----------------------------------------------------------------------

export default function InventoryDetailsPage({ params }) {
  const { id } = params;

  return <InventoryDetailsView id={id} />;
}
